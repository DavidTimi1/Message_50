import { IDBPromise, keysTable, loadDB, openTrans } from "../db";


const RSAKeyAlgorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048, // Key size
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: { name: "SHA-256" },
}


// Function to generate an RSA private-public key pair
export async function generateKeyPair() {
    try {
        // Generate RSA key pair
        const keyPair = await window.crypto.subtle.generateKey(
            RSAKeyAlgorithm,
            true, // Extractable (so we can export the keys)
            ["encrypt", "decrypt"]
        );

        // Export public key as pem strings
        const publicKey = await exportPublicKeyToSPKI( keyPair.publicKey ) ;

        // Store private key securely in IndexedDB
        await storePrivateKeyInIndexedDB(keyPair.privateKey);

        // Return public key to send or store externally
        return { publicKey };

    } catch (error) {
        console.error("Error generating key pair:", error);
        throw error;
    }
}


// Function to store private key in IndexedDB
async function storePrivateKeyInIndexedDB(privateKey) {
    
    loadDB()
    .then( async (db) => {
        
        const privateKeyData = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const privateKeyBuffer = new Uint8Array(privateKeyData);
        const privateKeyObject = {
            id: "privateKey",
            key: privateKeyBuffer
        };

        IDBPromise( 
            openTrans(db, "keys", "readwrite").put(privateKeyObject)

        ).then(() => {
            console.log("Private key stored successfully");

        }).catch((error) => {
            console.error("Failed to store private key:", error);
        });

    })
}

// Function to get private key from IndexedDB
async function getPrivateKey() {
    
    return loadDB()
    .then( DB => (

        IDBPromise( 
            openTrans(DB, keysTable).get("privateKey")

        ).then(async (privateKeyObject) => {
            const storedKey = privateKeyObject.key;

            const privateKeyData = await window.crypto.subtle.importKey(
                "pkcs8", 
                storedKey,
                {
                    name: "RSA-OAEP", hash: { name: "SHA-256" },
                },
                true, // Extractable (so we can export the keys)
                ["decrypt"]
            );
            return privateKeyData

        }).catch((error) => {
            throw ("Failed to get private key:", error);

        })

    ))
}


export async function exportPublicKeyToSPKI(publicKey) {
    const exportedKey = await window.crypto.subtle.exportKey("spki", publicKey);

    const exportedKeyBase64 = arrayBufferToBase64(exportedKey);
    const pem = `-----BEGIN PUBLIC KEY-----\n${addLineBreaks(exportedKeyBase64)}\n-----END PUBLIC KEY-----`;

    return pem;
}


function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


function addLineBreaks(str, lineLength = 64) {
    return str.match(new RegExp(`.{1,${lineLength}}`, 'g')).join('\n');
}


// Function to backup private key (e.g., download as a file)
export function backupPrivateKey(privateKey) {
    const blob = new Blob([JSON.stringify(privateKey)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "privateKeyBackup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("Private key backed up as privateKeyBackup.json");
}


// Function to restore private key from backup
export async function importPrivateKeyFromPEM(pem) {
    const base64Key = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").trim();
    const binaryKey = window.atob(base64Key);
    const binaryArray = new Uint8Array(binaryKey.length);
    
    for (let i = 0; i < binaryKey.length; i++) {
        binaryArray[i] = binaryKey.charCodeAt(i);
    }

    const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        binaryArray.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
    );

    return privateKey;
}


// Generate a random symmetric AES-GCM key
export async function generateSymmetricKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256, // AES-256
        },
        true, // Extractable (to share with the server after encryption)
        ["encrypt", "decrypt"]
    );
}


// Symmetrically encrypt JSON data
export async function encryptJsonData(jsonData, symmetricKey) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12-byte random IV
    const encodedData = encoder.encode(JSON.stringify(jsonData));

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv, // Initialization vector
        },
        symmetricKey,
        encodedData
    );

    return { encryptedData, iv };
}

// Symmetrically decrypt JSON data
export async function decryptDataToJSON(encryptedb64JSON, b64iv, symmetricKey) {
    const decoder = new TextDecoder();
    const encryptedJSON = base64ToArrayBuffer(encryptedb64JSON), iv = base64ToArrayBuffer(b64iv);
    
    const jsonData = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        symmetricKey,
        encryptedJSON
    );

    const decodedData = decoder.decode(jsonData)

    return JSON.parse(decodedData);

}


// Encrypt the symmetric key using the server's public key
export async function encryptSymmetricKey(symmetricKey, serverPublicKey) {
    const exportedKey = await window.crypto.subtle.exportKey("raw", symmetricKey);

    const encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        serverPublicKey, // PublicKey object from the server
        exportedKey
    );

    return arrayBufferToBase64(encryptedKey);
}

// Decrypt the symmetric key using the private key
export async function decryptSymmetricKey(encryptedKey, privateKey) {
    const decodedKey = base64ToArrayBuffer(encryptedKey);
    
    const decryptedKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        decodedKey
    );

    return window.crypto.subtle.importKey(
        "raw",
        decryptedKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}


// Import server's public key
export async function importServerPublicKey(pem) {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\n/g, "");
    const binaryDerString = atob(pemContents);
    const binaryDer = new Uint8Array(binaryDerString.split("").map((char) => char.charCodeAt(0)));

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}


// Full encryption workflow
export async function encryptMessage(jsonData, file) {
    // Step 2: Generate a symmetric key (AES)
    const symmetricKey = await generateSymmetricKey();

    // Step 3: Encrypt JSON data with the symmetric key
    const { encryptedData, iv } = await encryptJsonData(jsonData, symmetricKey);

    const encryptedFileData = file && await encryptMediaFile(file, symmetricKey)

    // Return the encrypted payload
    return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))), // Base64 for transport
        iv: btoa(String.fromCharCode(...iv)), // Base64 for transport
        key: symmetricKey,
        encryptedFileData
    };
}

// Full decryption workflow
export async function decryptMessage(encryptedKey, encryptedJSON, iv, hasFile) {
    // Step 1: Get user private key
    const privateKey = await getPrivateKey();

    // Step 2: Decrypt symmetric key (AES)
    const symmetricKey = await decryptSymmetricKey(encryptedKey, privateKey);

    // Step 3: Decrypt JSON data with the symmetric key
    const jsonData = await decryptDataToJSON(encryptedJSON, iv, symmetricKey);

    if (hasFile){
        const exportedKey = await window.crypto.subtle.exportKey("raw", symmetricKey);
        jsonData.key = exportedKey;
    }

    return jsonData;
}


// Full encryption workflow
export async function encryptMessageFull(jsonData, serverPublicKeyPem) {
    // Step 1: Import server's public key
    const serverPublicKey = await importServerPublicKey(serverPublicKeyPem);

    // Step 2: Generate a symmetric key (AES)
    const symmetricKey = await generateSymmetricKey();

    // Step 3: Encrypt JSON data with the symmetric key
    const { encryptedData, iv } = await encryptJsonData(jsonData, symmetricKey);

    // Step 4: Encrypt the symmetric key with the server's public key
    const encryptedKey = await encryptSymmetricKey(symmetricKey, serverPublicKey);

    // Return the encrypted payload
    return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))), // Base64 for transport
        encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedKey))), // Base64 for transport
        iv: btoa(String.fromCharCode(...iv)), // Base64 for transport
    };
}


export async function encryptMediaFile(file, symmetricKey) {
    const arrayBuffer = await file.arrayBuffer();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        symmetricKey,
        arrayBuffer
    );

    return { data: encryptedBuffer, iv: arrayBufferToBase64(iv) };
}



export async function decryptMediaFile(encryptedBuffer, ivBuffer, rawKey) {
    const iv = base64ToArrayBuffer(ivBuffer);
    console.log(rawKey, iv)

    const symmetricKey = await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );

        
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        symmetricKey,
        encryptedBuffer
    );

    return decryptedBuffer; // ArrayBuffer
}
