import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Platform, PermissionsAndroid, Alert, ScrollView, StyleSheet, Text, FlatList } from 'react-native'
import * as Application from 'expo-application';
// import { X, Brush } from '@tamagui/lucide-icons'
import { Link, Stack, useRouter } from 'expo-router'
import { getHeaderTitle } from '@react-navigation/elements';
import { Appbar, AnimatedFAB, Menu, List } from 'react-native-paper';
import Pdf from 'react-native-pdf'
import {
    View,
    Button,
    XStack,
    YStack,
    H1,
    ToggleGroup,
    Separator,
    Paragraph,
    SizableText,
    Input,
    Card,
    Dialog,
    Adapt,
    Sheet,
    Fieldset,
    Unspaced,
    YGroup,
    ListItem,
    H6
} from 'tamagui'
import { LayoutGrid, List as IconList, CircleEllipsis, FileSearch, X, Settings, Delete, ChevronRight } from '@tamagui/lucide-icons'
// import { fileList } from './scanner';
import { SimpleGrid } from 'react-native-super-grid';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'
import PdfThumbnail, { type ThumbnailResult } from "react-native-pdf-thumbnail";
import { fileList } from '../data/documentList';
import { Image } from 'expo-image'

const styles = StyleSheet.create({
    fab: {
        bottom: 16,
        position: 'absolute'
    },
})

const fabStyle = { right: 16 };

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

function AppVersion() {
    return <>{`Version ${Application.nativeApplicationVersion}`}</>
}

export default function HomePage() {
    // const [selectedSort, setSelectedSort] = useState()
    const { getItem } = useAsyncStorage('listData');
    const [searchInput, setSearchInput] = React.useState('')
    const [viewState, setViewState] = React.useState('grid')
    const [visible, setVisible] = React.useState(false);
    const [cardData, setCardData] = React.useState(fileList)
    const [thumbnail, setThumbnail] = React.useState<
        ThumbnailResult | undefined
    >()
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const router = useRouter();

    const getListData = async () => {
        const item = await getItem();
        return item != null ? setCardData(JSON.parse(item)) : null;
    };

    useEffect(() => {
        getListData();
    }, []);

    const storeLayout = async (value: string) => {
        try {
            await AsyncStorage.setItem('viewAs', value);
        } catch (e) {
            console.error(e)
        }
    };

    const removeData = async () => {
        try {
            await AsyncStorage.removeItem('listData');
            getListData();
        } catch (e) {
            console.error(e)
        }
    };

    const handleSearchInputChange = (text) => {
        setSearchInput(text);
    };
    const filteredCards = cardData.filter((card) =>
        card.title.toLowerCase().includes(searchInput.toLowerCase())
    );

    const handleValueChange = (value: string) => {
        storeLayout(value)
        setViewState(value)
    };
    // view option, image, linking

    // header: (props) => <NavigationBar {...props} />
    return (
        <SafeAreaView>
            <Stack.Screen options={{ headerShown: false, title: "DocExt" }} />
            <YStack height="100%" maxHeight="100%">
                <View padding="$5" height="100%" maxHeight="100%">
                    <XStack justifyContent='space-between'>
                        <H1 paddingTop="$5" paddingBottom="$3">DocExt</H1>
                        <Dialog modal>
                            <Dialog.Trigger asChild>
                                <Button size="$3" circular icon={Settings} scaleIcon={2} />
                            </Dialog.Trigger>

                            <Adapt when="sm" platform="touch">
                                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom moveOnKeyboardChange snapPointsMode='percent' snapPoints={[75]}>
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
                                    <Dialog.Title>Settings</Dialog.Title>
                                    <Dialog.Description>
                                        Adjust your preferences. Click anywhere outside when you're done.
                                    </Dialog.Description>

                                    <YGroup alignSelf="center" bordered width="95%" size="$4">
                                        <YGroup.Item>
                                            <ListItem onPress={() => { removeData() }} hoverTheme pressTheme icon={Delete} iconAfter={ChevronRight} title="Clear Data" subTitle={`This will clear the list of documents. \n Note: Document PDF's will not be deleted.`} />
                                        </YGroup.Item>
                                    </YGroup>
                                    <Separator />
                                    <XStack alignSelf='center' paddingTop="$5">
                                        <Image style={{ borderRadius: 15 }} source={require('../assets/images/adaptive-icon.png')} width={128} height={128} scale />
                                        <YStack alignSelf='center'>
                                        <H6 paddingLeft="$4">Tech Fiddle</H6>
                                            <H1 paddingLeft="$4">DocExt</H1>
                                            <H6 paddingLeft="$4">{AppVersion()}</H6>
                                        </YStack>
                                    </XStack>

                                    {/* <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button theme="active" aria-label="Close">
                                Save changes
                            </Button>
                        </Dialog.Close>
                    </XStack> */}

                                    <Unspaced>
                                        <Dialog.Close asChild>
                                            <Button
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
                    </XStack>
                    <YStack paddingBottom="$3" maxWidth='100%' paddingLeft={0} paddingRight={0}>
                        <Input
                            borderRadius="$3"
                            value={searchInput}
                            onChangeText={handleSearchInputChange}
                            placeholder="🔍  Search"
                            clearButtonMode="while-editing"
                            cursorColor="#076AF7"
                            enablesReturnKeyAutomatically
                            enterKeyHint="search"
                            keyboardAppearance="default"
                            height="$3"
                        />
                    </YStack>
                    <Separator />
                    <XStack
                        justifyContent='space-between'
                        paddingTop="$5"
                        paddingBottom="$5"
                    >
                        <ToggleGroup
                            orientation="horizontal"
                            size="$2"
                            type="single"
                            disableDeactivation={true}
                            onValueChange={handleValueChange}
                            value={viewState}
                            disabled={filteredCards.length === 0}
                        >
                            <ToggleGroup.Item value="grid" aria-label="View as grid">
                                <LayoutGrid />
                            </ToggleGroup.Item>
                            <ToggleGroup.Item value="list" aria-label="View as list">
                                <IconList />
                            </ToggleGroup.Item>
                        </ToggleGroup>
                        {/* <Menu
                                visible={visible}
                                onDismiss={closeMenu}
                                anchor={<Button onPress={openMenu} size="$2" chromeless icon={CircleEllipsis}>View Options</Button>}>
                                <Menu.Item onPress={() => { }} title="View Options" />
                                <Menu.Item onPress={() => { }} title="About" />
                            </Menu> */}
                        {/* <ViewOptionsDialog /> */}
                        <SizableText theme="alt1" size="$1" bottom="$1.25"><Paragraph fontWeight="800">{filteredCards.length}</Paragraph> {filteredCards.length === 1 ? 'Item' : 'Items'}</SizableText>
                    </XStack>
                    {filteredCards.length === 0 ?
                        (<View height="50%">
                            <XStack justifyContent='center' alignContent='center' flexDirection='row' opacity={0.6}>
                                <YStack justifyContent='center' alignContent='center' flexDirection='row'>
                                    <FileSearch size="$5" />
                                </YStack>
                            </XStack>
                            <XStack style={{ justifyContent: 'center', alignItems: 'center' }} opacity={0.6}>
                                <YStack justifyContent='center' alignContent='center' flexDirection='row'>
                                    <SizableText>No Documents</SizableText>
                                </YStack>
                            </XStack>
                        </View>
                        ) : (
                            viewState === 'grid' ? (
                                <View>
                                    <ScrollView>
                                        <SimpleGrid
                                            data={filteredCards}
                                            listKey='card'
                                            renderItem={({ item }) => (
                                                <Link href={{ pathname: '/pdf/[id]', params: { id: item.path, file: item.title } }}>
                                                    <Card size="$2" key={item.id} width={100} height={150} padding="$1">
                                                        <Card.Header borderRadius="$2" maxHeight="75%">
                                                            {/* <Pdf source={{ uri: `${item.path}` }} onError={console.error} singlePage showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} /> */}
                                                            <Image style={{ borderRadius: 10 }} source={item.thumbnail as string} placeholder={blurhash} cachePolicy="memory" contentFit='contain' width="100%" height="100%" scale />
                                                        </Card.Header>
                                                        <Card.Footer paddingHorizontal="$2">
                                                            <SizableText size="$1">{item.title}</SizableText>
                                                        </Card.Footer>
                                                    </Card>
                                                </Link>
                                            )}
                                        />
                                    </ScrollView>
                                </View>
                            ) : (
                                <View paddingTop="$5">
                                    <FlatList
                                        data={filteredCards}
                                        renderItem={({ item }) =>
                                            <List.Item
                                                onPress={() => { router.push('/pdf/[id]') }}
                                                title={item.title}
                                                left={props => <List.Icon {...props} icon="file-pdf-box" />}
                                            />}
                                        keyExtractor={item => item.id}
                                    />
                                </View>
                            )
                        )}

                    <AnimatedFAB
                        visible
                        icon={"cube-scan"}
                        label={"Scan Document"}
                        style={[styles.fab, fabStyle]}
                        extended
                        animateFrom='right'
                        iconMode='dynamic'
                        onPress={() => { router.push('/scanner') }}
                    />
                </View>
            </YStack>
        </SafeAreaView>
    )
}

export function NavigationBar({ route, options }) {
    const title = getHeaderTitle(options, route.name);
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <>
            <Appbar.Header>
                <Appbar.Action icon="magnify" onPress={() => { }} />
                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={<Appbar.Action icon='dots-vertical' onPress={() => { openMenu }} />}>
                    <Menu.Item onPress={() => { }} title="View Options" />
                    <Menu.Item onPress={() => { }} title="About" />
                </Menu>
            </Appbar.Header>

        </>
    );
}

function ViewOptionsDialog() {
    return (
        <Dialog modal>
            <Dialog.Trigger asChild>
                <Button size="$2" chromeless icon={CircleEllipsis}>View Options</Button>
            </Dialog.Trigger>

            <Adapt when="sm" platform="touch">
                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom moveOnKeyboardChange snapPointsMode='percent' snapPoints={[30]}>
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
                    <Dialog.Title>View Options</Dialog.Title>
                    <Dialog.Description>
                        Adjust the viewing options according to your preference. Click on save when you're done.
                    </Dialog.Description>
                    <Fieldset gap="$4" horizontal>

                    </Fieldset>

                    <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button theme="active" aria-label="Close">
                                Save changes
                            </Button>
                        </Dialog.Close>
                    </XStack>

                    <Unspaced>
                        <Dialog.Close asChild>
                            <Button
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
    )
}
