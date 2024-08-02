import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Linking, Platform } from 'react-native'
import { Stack, useRouter, Link, useLocalSearchParams } from 'expo-router'
import Pdf from 'react-native-pdf'
import * as Burnt from "burnt";
import { Appbar, Text } from 'react-native-paper';
import Share from "react-native-share"
import * as FileSystem from 'expo-file-system';
import { View, Separator, H2, Paragraph, Button as TButton, Progress, Square } from 'tamagui'
import { Image } from 'expo-image'

export default function PDFView() {
    const { id, file } = useLocalSearchParams()
    const [currentPage, setCurrentPage] = React.useState('')
    // const [rename, setRename] = React.useState(file)
    // const [visible, setVisible] = React.useState(false)
    const router = useRouter()
    const finalPath = { uri: `file://${id}` }
    const sharePath = `file://${id}`
    // const showDialog = () => setVisible(true)
    // const hideDialog = () => setVisible(false)

    // Test this
    const options = Platform.select({
        default: {
            title: `Share ${id}.pdf`,
            type: 'application/pdf',
            showAppsToView: true,
            url: sharePath
        },
        ios: {
            activityItemSources: [
                {
                    placeholderItem: {
                        type: 'airDrop'
                    },
                    item: {
                        default: {
                            type: 'airDrop'
                        },
                    },
                },
                {
                    placeholderItem: {
                        type: 'copyToPasteBoard'
                    },
                    item: {
                        default: {
                            type: 'copyToPasteBoard'
                        },
                    },
                },
                {
                    placeholderItem: {
                        type: 'mail'
                    },
                    item: {
                        default: {
                            type: 'mail'
                        },
                    },
                },
                {
                    placeholderItem: {
                        type: 'markupAsPDF'
                    },
                    item: {
                        default: {
                            type: 'markupAsPDF'
                        },
                    },
                },
                {
                    placeholderItem: {
                        type: 'print'
                    },
                    item: {
                        default: {
                            type: 'print'
                        },
                    },
                },
            ],
            saveToFiles: true
        }
    })

    const openShare = () =>
        Share.open(options)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                err && console.log(err);
            });

    // const renamePdf = (filename) =>
    //     FileSystem.moveAsync({ from: `file://${id}`, to: `file://${FileSystem.documentDirectory}${filename}` })

    return (
        <>
            <Stack.Screen options={{ headerShown: false, title: "PDF Viewer", gestureEnabled: true, gestureDirection: 'horizontal' }} />
            <Appbar.Header elevated={false}>
                <Appbar.BackAction onPress={() => { router.push('/') }} />
                <Appbar.Content title="View PDF" />
                <Text variant="labelMedium">{currentPage}</Text>
                {id ? (<Appbar.Action icon="export-variant" onPress={() => { openShare() }} />) : null}
                {/* <Appbar.Action icon="pencil" onPress={showDialog} /> */}
            </Appbar.Header>
            {/* <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Rename PDF</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Rename your PDF file</Text>
                        <TextInput
                            label="Email"
                            value={file as string}
                            onChangeText={updatedFile => setRename(updatedFile)} />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button onPress={renamePdf}>Save</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal> */}
            {!id ? (
                <View padding="$5" flexDirection='column' justifyContent='center' alignContent='center'>
                    <Square>
                        <Image source={require('../../assets/images/loading.svg')} cachePolicy='memory' contentFit='contain' width="110%" height="60%" scale placeholderContentFit='fill' />
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
                    renderActivityIndicator={(progress) => { <Text>Loading PDF...</Text> }}
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