const { db, auth, adminAuth, googleProvider } = require('../config/firebase');
const { 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    setDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    orderBy, 
    where 
} = require('firebase/firestore');
const { 
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithCredential,
    GoogleAuthProvider
} = require('firebase/auth');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Email ActionCodeSettings
const actionCodeSettings = {
    url: process.env.FRONTEND_URL || 'http://localhost:5173/verify-email',
    handleCodeInApp: true,
};

// Send passwordless sign-in link to email
const sendSignInLink = async (email) => {
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        
        // Store email in Firestore for verification reference
        const emailLinkData = {
            email,
            createdAt: Date.now(),
            verified: false
        };
        
        const docRef = await addDoc(collection(db, "emailLinks"), emailLinkData);
        
        return { 
            linkId: docRef.id,
            message: "Sign-in link sent successfully. Check your email." 
        };
    } catch (error) {
        console.error("Error sending sign-in link:", error);
        throw new Error("Error sending sign-in link: " + error.message);
    }
};

// Verify sign-in email link
const verifySignInLink = async (email, link) => {
    try {
        if (!email || !link) {
            throw new Error("Email and sign-in link are required");
        }
        
        if (!isSignInWithEmailLink(auth, link)) {
            throw new Error("Invalid sign-in link");
        }
        
        // Sign in with email link
        const result = await signInWithEmailLink(auth, email, link);
        const user = result.user;
        
        // Mark any pending links for this email as verified
        const emailLinksRef = collection(db, "emailLinks");
        const q = query(emailLinksRef, where("email", "==", email), where("verified", "==", false));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (document) => {
            await setDoc(doc(db, "emailLinks", document.id), { verified: true }, { merge: true });
        });
        
        return await processAuthResult(user);
    } catch (error) {
        console.error("Error verifying sign-in link:", error);
        throw new Error("Error verifying sign-in link: " + error.message);
    }
};

// Google Authentication
const signInWithGoogle = async (idToken) => {
    try {
        let user;
        
        if (idToken) {
            // If we have an ID token (from frontend), use it to sign in
            const credential = GoogleAuthProvider.credential(idToken);
            const result = await signInWithCredential(auth, credential);
            user = result.user;
        } else {
            // Perform a popup sign-in (this typically happens in client-side code)
            // This is included here for completeness but should typically be called from frontend
            const result = await signInWithPopup(auth, googleProvider);
            user = result.user;
        }
        
        return await processAuthResult(user);
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw new Error("Error signing in with Google: " + error.message);
    }
};

// Process authentication result and create/update user in Firestore
const processAuthResult = async (user) => {
    // Check if user exists in Firestore
    let firestoreUser = null;
    let isNewUser = false;
    let firestoreId = null;
    
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", user.email));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
        isNewUser = true;
        
        // Create a new user in Firestore
        const newUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'user', // Default role
            createdOn: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            provider: user.providerData[0]?.providerId || 'unknown'
        };
        
        const docRef = await addDoc(collection(db, "users"), newUserData);
        firestoreId = docRef.id;
        firestoreUser = newUserData;
    } else {
        firestoreUser = userSnapshot.docs[0].data();
        firestoreId = userSnapshot.docs[0].id;
        
        // Update last login time and other fields
        const updateData = {
            lastLogin: new Date().toISOString()
        };
        
        // Update UID if not already set
        if (!firestoreUser.uid && user.uid) {
            updateData.uid = user.uid;
            firestoreUser.uid = user.uid;
        }
        
        // Update display name and photo if available and not set
        if (user.displayName && !firestoreUser.displayName) {
            updateData.displayName = user.displayName;
            firestoreUser.displayName = user.displayName;
        }
        
        if (user.photoURL && !firestoreUser.photoURL) {
            updateData.photoURL = user.photoURL;
            firestoreUser.photoURL = user.photoURL;
        }
        
        // Update provider if it's a new one
        if (user.providerData && user.providerData[0]) {
            const newProvider = user.providerData[0].providerId;
            if (!firestoreUser.provider) {
                updateData.provider = newProvider;
                firestoreUser.provider = newProvider;
            }
        }
        
        await setDoc(doc(db, "users", firestoreId), updateData, { merge: true });
    }
    
    // Generate JWT token with appropriate role
    const role = firestoreUser.role || 'user';
    const token = jwt.sign({ 
        userId: user.uid, 
        email: user.email,
        role,
        twoFactorVerified: true 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    return { 
        token,
        user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || firestoreUser.displayName || '',
            photoURL: user.photoURL || firestoreUser.photoURL || '',
            role: firestoreUser.role || 'user',
            provider: firestoreUser.provider || (user.providerData[0]?.providerId || 'unknown')
        },
        isNewUser,
        firestoreId
    };
};

// Register a new user (after email verification)
const register = async (userData) => {
    try {
        const { email, password, role = 'user', ...otherData } = userData;
        
        if (!email) {
            throw new Error("Email is required");
        }
        
        // Check if role is valid
        if (!['admin', 'sales', 'user'].includes(role)) {
            throw new Error("Invalid role");
        }
        
        let uid = null;
        let user = null;
        
        // Create user in Firebase Auth if password is provided
        if (password) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
                uid = user.uid;
            } catch (error) {
                console.error("Error creating user in Firebase Auth:", error);
                // Continue with just Firestore if Auth creation fails
            }
        } else {
            // For passwordless auth, get existing user's UID
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                if (userData.uid) {
                    uid = userData.uid;
                }
            }
        }
        
        // Create or update user in Firestore with additional data
        const userWithTimestamp = { 
            email,
            role,
            createdOn: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            ...otherData
        };
        
        if (uid) {
            userWithTimestamp.uid = uid;
        }
        
        if (user && user.displayName) {
            userWithTimestamp.displayName = user.displayName;
        }
        
        if (user && user.photoURL) {
            userWithTimestamp.photoURL = user.photoURL;
        }
        
        // Check if user already exists in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        let docRef;
        
        if (!querySnapshot.empty) {
            // Update existing user
            const userDoc = querySnapshot.docs[0];
            await setDoc(doc(db, "users", userDoc.id), userWithTimestamp, { merge: true });
            docRef = { id: userDoc.id };
        } else {
            // Create new user
            docRef = await addDoc(collection(db, "users"), userWithTimestamp);
        }
        
        // Generate JWT token
        const token = jwt.sign({ 
            userId: uid || docRef.id, 
            email,
            role,
            twoFactorVerified: true 
        }, JWT_SECRET, { expiresIn: '24h' });
        
        return { 
            id: docRef.id, 
            ...userWithTimestamp, 
            token
        };
    } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("Error registering user: " + error.message);
    }
};

// Login with email and password
const login = async (data) => {
    try {
        const { email, password } = data;
        
        if (!email) {
            throw new Error("Email is required");
        }
        
        let user = null;
        
        // If password is provided, try to authenticate with Firebase Auth
        if (password) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
                
                // Update last login in Firestore
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    // Update last login
                    const userDoc = querySnapshot.docs[0];
                    await setDoc(doc(db, "users", userDoc.id), { lastLogin: new Date().toISOString() }, { merge: true });
                }
                
                return await processAuthResult(user);
            } catch (error) {
                console.error("Error signing in with email/password:", error);
                throw new Error("Invalid email or password");
            }
        } else {
            // In case passwordless auth didn't work through normal flow
            throw new Error("Password is required for this login method");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        throw new Error("Error logging in: " + error.message);
    }
};

// Create custom token (for admin use)
const createCustomToken = async (uid, role) => {
    try {
        // Create a custom token using Admin SDK
        const customToken = await adminAuth.createCustomToken(uid, { role });
        return customToken;
    } catch (error) {
        console.error("Error creating custom token:", error);
        throw new Error("Error creating custom token: " + error.message);
    }
};

// Set user role (admin only)
const setUserRole = async (uid, role) => {
    try {
        if (!['admin', 'sales', 'user'].includes(role)) {
            throw new Error("Invalid role");
        }
        
        // Find user in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error("User not found");
        }
        
        // Update user role
        const userDoc = querySnapshot.docs[0];
        await setDoc(doc(db, "users", userDoc.id), { role }, { merge: true });
        
        return { 
            message: "User role updated successfully",
            role
        };
    } catch (error) {
        console.error("Error setting user role:", error);
        throw new Error("Error setting user role: " + error.message);
    }
};

// Get all users from Firestore
const getUsers = async () => {
    try {
        const usersQuery = query(collection(db, "users"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(usersQuery);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Error fetching users: " + error.message);
    }
};

// Get a single user by ID from Firestore
const getUserById = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Error fetching user: " + error.message);
    }
};

// Update a user by ID in Firestore
const updateUser = async (userId, userData) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, userData, { merge: true });
        return { id: userId, ...userData };
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Error updating user: " + error.message);
    }
};

// Delete a user by ID from Firestore and Auth
const deleteUser = async (userId) => {
    try {
        // Get user from Firestore to get uid
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }
        
        const userData = userDoc.data();
        
        // Delete from Auth if uid exists
        if (userData.uid) {
            try {
                await adminAuth.deleteUser(userData.uid);
            } catch (error) {
                console.error("Error deleting user from Firebase Auth:", error);
                // Continue with Firestore deletion
            }
        }
        
        // Delete from Firestore
        await deleteDoc(userRef);
        
        return { message: "User deleted successfully" };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Error deleting user: " + error.message);
    }
};

module.exports = { 
    login, 
    register,
    sendSignInLink,
    verifySignInLink,
    signInWithGoogle,
    createCustomToken,
    setUserRole,
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser
};