// Function to generate an RSA private-public key pair
export async function generateKeyPair() {
    try {
        // Generate RSA key pair
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048, // Key size
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: { name: "SHA-256" },
            },
            true, // Extractable (so we can export the keys)
            ["encrypt", "decrypt"]
        );

        // Export keys as JSON strings
        const publicKey = await exportPublicKeyToSPKI( keyPair.publicKey ) ;

        // Store private key securely (IndexedDB is recommended, but here we use localStorage as an example)

        // Return public key to send or store externally
        return { publicKey, privateKey }; // Both keys as JSON

    } catch (error) {
        console.error("Error generating key pair:", error);
        throw error;
    }
}

async function exportPrivateKeyToPEM(privateKey) {
    const exportedKey = await window.crypto.subtle.exportKey("pkcs8", privateKey);

    const exportedKeyBase64 = arrayBufferToBase64(exportedKey);
    const pem = `-----BEGIN PRIVATE KEY-----\n${addLineBreaks(exportedKeyBase64)}\n-----END PRIVATE KEY-----`;

    return pem;
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

    return encryptedKey;
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

    const encryptedFileData = await encryptMediaFile(file, symmetricKey)

    // Return the encrypted payload
    return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encryptedData))), // Base64 for transport
        iv: btoa(String.fromCharCode(...iv)), // Base64 for transport
        key: symmetricKey,
        encryptedFileData
    };
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

    return { encryptedBuffer, iv };
}


export async function decryptMediaFile(encryptedBuffer, iv, symmetricKey) {
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
