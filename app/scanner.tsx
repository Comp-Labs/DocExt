import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { createPdf } from 'react-native-images-to-pdf';
import * as Burnt from "burnt";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fileList } from '../data/documentList';
import PdfThumbnail from "react-native-pdf-thumbnail";

export default function Scanner() {
    const router = useRouter()
    const createAlert = () =>
        Alert.alert('Failure', 'There was an error scanning the document', [
            { text: 'OK', onPress: () => router.dismissAll() },
        ]);

    const getPdfThumbnail = async (pdfPath) => {
        try {
            const result = await PdfThumbnail.generate(pdfPath, 0, 100)
            return result;
        } catch (e) {
            console.error(e)
            return null;
        }
    }

    const scanDocument = async () => {
        // ... (camera permission handling if needed)

        try {
            // Start the Document Scanner
            const { scannedImages } = await DocumentScanner.scanDocument({ croppedImageQuality: 50 })

            if (scannedImages) {
                const cardListString = await AsyncStorage.getItem('listData')
                let cardList

                if (cardListString !== null) {
                    cardList = JSON.parse(cardListString)
                } else {
                    // Initialize with initial data if none exists
                    cardList = fileList
                }

                const filename = `${new Date().getTime()}.pdf`; // Generate unique filename

                // Get document directory for path construction
                const documentDirectory = await FileSystem.documentDirectory;

                // Create the PDF
                const docPath = `${documentDirectory}${filename}`;
                await createPdf({
                    pages: scannedImages.map((imagePath) => ({ imagePath })),
                    outputPath: docPath,
                })
                console.log(`PDF created successfully: ${docPath}`)

                // Generate thumbnail (handle potential errors)
                const thumbnailPath = await getPdfThumbnail(docPath).catch((error) => {
                    console.error('Error generating thumbnail:', error)
                    return null;
                })

                const cardId = Math.random() as number

                // Update card list with PDF details
                cardList.push({
                    title: filename,
                    path: docPath,
                    id: cardId,
                    thumbnail: thumbnailPath?.uri, // Use optional chaining to handle null thumbnail
                });
                await AsyncStorage.setItem('listData', JSON.stringify(cardList))
                // console.log(docPath)
                // Navigate to PDF view
                await router.push({ pathname: `/pdf/[id]`, params: { id: cardId, title: filename, path: docPath } });
            }
        } catch (error) {
            console.error('Failed to scan documents:', error)
            createAlert()
        }
    }

    useEffect(() => {
        scanDocument()
    }, [])

    return <Stack.Screen options={{ headerShown: false, title: "Scan Document" }} />;
}