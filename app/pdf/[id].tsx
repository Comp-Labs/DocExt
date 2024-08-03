import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Linking, Platform } from 'react-native'
import { Stack, useRouter, Link, useLocalSearchParams } from 'expo-router'
import Pdf from 'react-native-pdf'
import * as Burnt from "burnt";
import { Appbar, Text, Portal, TextInput, Dialog as RDialog, Button } from 'react-native-paper';
import Share from "react-native-share"
import * as FileSystem from 'expo-file-system';
import { View, Separator, H2, Paragraph, Button as TButton, Dialog, Adapt, Sheet, Unspaced, YGroup, ListItem, Square } from 'tamagui'
import { Trash2, Share as TShare, Download, X, Edit3 } from '@tamagui/lucide-icons'
import { Image } from 'expo-image'
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage'
import RNFetchBlob from 'rn-fetch-blob'
import { Double } from 'react-native/Libraries/Types/CodegenTypes'

export default function PDFView() {
    const { id, title, path } = useLocalSearchParams()
    const [currentPage, setCurrentPage] = React.useState('')
    const [rename, setRename] = React.useState(title)
    const [visible, setVisible] = React.useState(false)
    const router = useRouter()
    const finalPath = { uri: `file://${path}` }
    const sharePath = `${path}`
    const showDialog = () => setVisible(true)
    const hideDialog = () => setVisible(false)

    // Test this
    const options = Platform.select({
        default: {
            title: `Share ${title}`,
            type: 'application/pdf',
            showAppsToView: true,
            url: sharePath
        }
        // ,
        // ios: {
        //     activityItemSources: [
        //         {
        //             placeholderItem: {
        //                 type: 'airDrop'
        //             },
        //             item: {
        //                 default: {
        //                     type: 'airDrop'
        //                 },
        //             },
        //         },
        //         {
        //             placeholderItem: {
        //                 type: 'copyToPasteBoard'
        //             },
        //             item: {
        //                 default: {
        //                     type: 'copyToPasteBoard'
        //                 },
        //             },
        //         },
        //         {
        //             placeholderItem: {
        //                 type: 'mail'
        //             },
        //             item: {
        //                 default: {
        //                     type: 'mail'
        //                 },
        //             },
        //         },
        //         {
        //             placeholderItem: {
        //                 type: 'markupAsPDF'
        //             },
        //             item: {
        //                 default: {
        //                     type: 'markupAsPDF'
        //                 },
        //             },
        //         },
        //         {
        //             placeholderItem: {
        //                 type: 'print'
        //             },
        //             item: {
        //                 default: {
        //                     type: 'print'
        //                 },
        //             },
        //         },
        //     ],
        //     saveToFiles: true
        // }
    })

    const openShare = () =>
        Share.open(options)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                err && console.log(err);
            });

    // const renamePdf = async (newFilename) => {
    //     try {
    //         console.log(rename)
    //         hideDialog
    //         const oldPath = `${path}`;
    //         const newPath = `${FileSystem.documentDirectory}${newFilename}.pdf`;

    //         // Rename file in file system
    //         await FileSystem.moveAsync({ from: oldPath, to: newPath });

    //         // Update list data in AsyncStorage
    //         const listData = JSON.parse(await AsyncStorage.getItem('listData') || '[]') // Handle potential null value
    //         listData[newFilename] = listData[id]; // Rename the object
    //         delete listData[id]; // Remove the old object
    //         await AsyncStorage.setItem('listData', JSON.stringify(listData));

    //         // Update UI or other necessary actions
    //     } catch (error) {
    //         console.error('Error renaming PDF or list data:', error);
    //         // Handle errors appropriately (e.g., display an error message)
    //     }
    // };

    // const downloadPdf = () => {
    //     const dirs = RNFetchBlob.fs.dirs
    //     RNFetchBlob
    //         .config({
    //             path : dirs.DocumentDir + `/${file}`,
    //             addAndroidDownloads: {
    //                 useDownloadManager: true,
    //                 // Optional, but recommended since android DownloadManager will fail when
    //                 // the url does not contains a file extension, by default the mime type will be text/plain
    //                 mime: 'application/pdf',
    //                 description: 'File downloaded by download manager.'
    //             }
    //         })
    //         .fetch('GET', `file://${FileSystem.documentDirectory}${title}`)
    //         .then((resp) => {
    //             // the path of downloaded file
    //             resp.path()
    //         })
    // }
    // const deletePdf = async () => {
    //     try {
    //         await FileSystem.deleteAsync(`${path}`); // Assuming id is the filename

    //         // Retrieve and update data in a single step (avoids potential race condition)
    //         const listData = JSON.parse(await AsyncStorage.getItem('listData') || '[]'); // Handle potential null value
    //         console.log(listData)

    //         const index = listData.findIndex((item) => item.id === id);

    //         if (index !== -1) {
    //             listData.splice(index, 1); // Remove the item from the array
    //             await AsyncStorage.setItem('listData', JSON.stringify(listData));
    //         }

    //         await router.push('/');
    //     } catch (error) {
    //         console.error('Error deleting PDF or list data:', error);
    //         // Handle errors appropriately (e.g., display an error message)
    //     }
    // };

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: "PDF Viewer", gestureEnabled: true, gestureDirection: 'horizontal' }} />
            <Appbar.Header elevated={false}>
                <Appbar.BackAction onPress={() => { router.push('/') }} />
                <Appbar.Content title="View PDF" />
                <Text variant="labelMedium">{currentPage}</Text>
                {id ? (<Appbar.Action icon="export-variant" onPress={() => { openShare() }} />) : null}
                {id ? (
                    <Dialog modal>
                        <Dialog.Trigger asChild>
                            <Appbar.Action icon="dots-vertical" />
                        </Dialog.Trigger>

                        <Adapt when="sm" platform="touch">
                            <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom moveOnKeyboardChange snapPointsMode='percent' snapPoints={[15]}>
                                <Sheet.Frame padding="$4" gap="$4">
                                    <Adapt.Contents />
                                </Sheet.Frame>
                                <Sheet.Overlay
                                    animation="lazy"
                                    enterStyle={{ opacity: 0 }}
                                    exitStyle={{ opacity: 0 }}
                                />
                            </Sheet>
                        </Adapt>

                        <Dialog.Portal>
                            <Dialog.Overlay
                                key="overlay"
                                animation="slow"
                                opacity={0.5}
                                enterStyle={{ opacity: 0 }}
                                exitStyle={{ opacity: 0 }}
                            />

                            <Dialog.Content
                                bordered
                                elevate
                                key="content"
                                animateOnly={['transform', 'opacity']}
                                animation={[
                                    'quicker',
                                    {
                                        opacity: {
                                            overshootClamping: true,
                                        },
                                    },
                                ]}
                                enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                                exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                                gap="$4"
                            >
                                <Dialog.Title>File Options</Dialog.Title>

                                <YGroup>
                                    {/* <YGroup.Item>
                                        <ListItem onPress={() => { showDialog() }} hoverTheme pressTheme icon={Edit3} title="Rename" />
                                    </YGroup.Item> */}
                                    {/* 
                                    <YGroup.Item>
                                        <ListItem onPress={() => { downloadPdf() }} hoverTheme pressTheme icon={Download} title="Download" />
                                    </YGroup.Item>
                                     */}
                                    <YGroup.Item>
                                        <ListItem onPress={() => { openShare() }} hoverTheme pressTheme icon={TShare} title="Share" />
                                    </YGroup.Item>
                                    {/* <YGroup.Item>
                                        <ListItem onPress={() => { deletePdf() }} hoverTheme pressTheme icon={Trash2} title="Delete" />
                                    </YGroup.Item> */}
                                </YGroup>

                                <Unspaced>
                                    <Dialog.Close asChild>
                                        <TButton
                                            position="absolute"
                                            top="$3"
                                            right="$3"
                                            size="$2"
                                            circular
                                            icon={X}
                                        />
                                    </Dialog.Close>
                                </Unspaced>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog>
                ) : null}
            </Appbar.Header>
            {/* <Portal>
                <RDialog visible={visible} onDismiss={hideDialog}>
                    <RDialog.Title>Rename PDF</RDialog.Title>
                    <RDialog.Content>
                        <Text variant="bodyMedium">Rename your PDF file</Text>
                        <TextInput
                            label="File Name"
                            value={rename as string}
                        // onChangeText={updatedFile => setRename(updatedFile)}
                        />
                    </RDialog.Content>
                    <RDialog.Actions>
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button onPress={renamePdf}>Save</Button>
                    </RDialog.Actions>
                </RDialog>
            </Portal> */}
            {!path ? (
                <View padding="$5" flexDirection='column' justifyContent='center' alignContent='center'>
                    <Square>
                        <Image source={require('../../assets/images/loading.svg')} cachePolicy='memory' contentFit='contain' height="60%" width="110%" scale placeholderContentFit='fill' />
                    </Square>

                    <H2 paddingBottom="$3">No Document Available</H2>
                    <Paragraph size="$5" fontWeight="600">Sorry, no document is available for viewing.</Paragraph>
                    <Separator marginVertical={15} />
                    <Link href="/" asChild><TButton>Back to Homepage</TButton></Link>
                </View>
            ) : (
                <Pdf
                    style={{ flex: 1 }}
                    onError={console.error}
                    source={finalPath}
                    // renderActivityIndicator={(progress) => { <Text>Loading PDF...</Text> }}
                    onPageChanged={(page, numberOfPages) => {
                        setCurrentPage(`Page ${page} of ${numberOfPages}`)
                    }}
                    onPressLink={(url: string) => {
                        Linking.openURL(url)
                    }}
                />
            )}
        </>
    )
}
