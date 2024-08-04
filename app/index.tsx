import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl, FlatList } from 'react-native';
import * as Application from 'expo-application';
import { Link, Stack, useRouter } from 'expo-router';
import { getHeaderTitle } from '@react-navigation/elements';
import { Appbar, AnimatedFAB, Menu, List } from 'react-native-paper';
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
    H6,
    Switch
} from 'tamagui'
import { LayoutGrid, List as IconList, CircleEllipsis, FileSearch, X, Settings, Delete, ChevronRight, AArrowDown, AArrowUp } from '@tamagui/lucide-icons';
import { SimpleGrid } from 'react-native-super-grid';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { fileList } from '../data/documentList';
import { Image } from 'expo-image';

const sortJsonArray = require('sort-json-array')

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

function AppVersion() {
    return <>{`Version ${Application.nativeApplicationVersion}`}</>;
}

export default function HomePage() {
    const [searchInput, setSearchInput] = React.useState('')
    const [sort, setSort] = React.useState('')
    const [order, setOrder] = React.useState('descending')
    const [isChecked, setIsChecked] = React.useState(true)
    const [viewState, setViewState] = React.useState('grid')
    const [visible, setVisible] = React.useState(false)
    const [cardData, setCardData] = React.useState(fileList)
    const [refreshing, setRefreshing] = React.useState(false)
    const router = useRouter()

    const getListData = async () => {
        const item = await AsyncStorage.getItem('listData')
        return item != null ? setCardData(JSON.parse(item)) : setCardData(fileList);
    }

    useEffect(() => {
        getListData()
    }, [])

    const handleSearchInputChange = (text) => {
        setSearchInput(text)
    }
    const filteredCards = cardData?.filter((card) =>
        card.title.toLowerCase().includes(searchInput.toLowerCase())
    )

    const storeLayout = async (value: string) => {
        try {
            await AsyncStorage.setItem('viewAs', value)
            setCardData(currentData => ({ ...currentData, viewLayout: value }))
        } catch (e) {
            console.error(e)
        }
    }

    const storeOrder = async (value: string) => {
        try {
            await AsyncStorage.setItem('order', value)
            // setCardData(currentData => ({ ...currentData, order: value }))
        } catch (e) {
            console.error(e)
        }
    }

    const handleValueChange = (value: string) => {
        // storeLayout(value)
        setViewState(value)
    }

    const handleOrderChange = (value: string) => {
        storeOrder(value)
        setOrder(value)
    }

    const removeData = async () => {
        try {
            const deleteList = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}`)
            await AsyncStorage.removeItem('listData')
            // Filter for PDF files only
            const pdfFiles = deleteList.filter(file => file.endsWith('.pdf'))

            // Delete each PDF file
            pdfFiles.forEach(async (file) => {
                try {
                    const filePath = `${FileSystem.documentDirectory}/${file}`
                    await FileSystem.deleteAsync(filePath)
                } catch (e) {
                    console.error(e)
                }
            })
            setCardData(fileList)
            getListData()
        } catch (e) {
            console.error(e)
        }
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        getListData()
        setTimeout(() => {
            setRefreshing(false)
        }, 2000);
    }, [])

    // const handleCheck = (value: boolean) => {
    //     setIsChecked(value)
    // }
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
                                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom moveOnKeyboardChange snapPointsMode='percent' snapPoints={[70, 90]}>
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
                                    <ScrollView>
                                        <Dialog.Title>Settings</Dialog.Title>
                                        <Dialog.Description>
                                            Adjust your preferences. Click anywhere outside when you're done.
                                        </Dialog.Description>

                                        <YGroup alignSelf="center" bordered width="100%" size="$4">
                                            <YGroup.Item>
                                                <ListItem onPress={() => { removeData() }} hoverTheme pressTheme icon={Delete} iconAfter={ChevronRight} title="Clear Data" subTitle={`This will clear all the documents from the 'app data'.`} />
                                            </YGroup.Item>
                                        </YGroup>
                                        <H6>View Options</H6>
                                        <YGroup alignSelf="center" bordered width="100%" size="$4">
                                            <YGroup.Item>
                                                <ListItem
                                                    hoverTheme
                                                    pressTheme
                                                    title="View As"
                                                    iconAfter={
                                                        <ToggleGroup
                                                            orientation="horizontal"
                                                            size="$2"
                                                            type="single"
                                                            // disableDeactivation={true}
                                                            onValueChange={handleValueChange}
                                                            value={viewState}
                                                        // disabled={filteredCards.length === 0}
                                                        >
                                                            <ToggleGroup.Item value="grid" aria-label="View as grid">
                                                                <LayoutGrid />
                                                            </ToggleGroup.Item>
                                                            <ToggleGroup.Item value="list" aria-label="View as list">
                                                                <IconList />
                                                            </ToggleGroup.Item>
                                                        </ToggleGroup>
                                                    }
                                                />
                                            </YGroup.Item>
                                            <YGroup.Item>
                                                <ListItem
                                                    hoverTheme
                                                    pressTheme
                                                    title="Order As"
                                                    subTitle="Ascending (Old First) / Descending (New First)"
                                                    iconAfter={
                                                        <ToggleGroup
                                                            orientation="horizontal"
                                                            size="$2"
                                                            type="single"
                                                            // disableDeactivation={true}
                                                            onValueChange={() => handleOrderChange}
                                                            value={order}
                                                        // disabled={filteredCards.length === 0}
                                                        >
                                                            <ToggleGroup.Item value="ascending" aria-label="Ascending">
                                                                <AArrowUp />
                                                            </ToggleGroup.Item>
                                                            <ToggleGroup.Item value="descending" aria-label="Descending">
                                                                <AArrowDown />
                                                            </ToggleGroup.Item>
                                                        </ToggleGroup>
                                                    }
                                                />
                                            </YGroup.Item>
                                            {/* <ListItem onPress={() => { removeData() }} hoverTheme pressTheme iconAfter={<Switch size="$3" defaultChecked onCheckedChange={handleCheck(isChecked)} value={isChecked}><Switch.Thumb animation="quicker" /></Switch>} title="Show All Filename Extensions" /> */}
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
                                    </ScrollView>

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
                            // disableDeactivation={true}
                            onValueChange={filteredCards.length !== 0 ? (value) => handleValueChange(value) : undefined}
                            value={viewState}
                        // disabled={filteredCards.length === 0}
                        >
                            <ToggleGroup.Item value="grid" aria-label="View as grid">
                                <LayoutGrid />
                            </ToggleGroup.Item>
                            <ToggleGroup.Item value="list" aria-label="View as list">
                                <IconList />
                            </ToggleGroup.Item>
                        </ToggleGroup>
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
                                order === 'ascending' ?
                                    (
                                        <View>
                                            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                                                <SimpleGrid
                                                    data={sortJsonArray(filteredCards, 'title', 'asc')}
                                                    listKey='card'
                                                    renderItem={({ item }) => (
                                                        <Link href={{ pathname: '/pdf/[id]', params: { id: item.id as number, title: item.title as string, path: item.path as string } }}>
                                                            <Card size="$2" key={item.id} width={100} height={150} padding="$1">
                                                                <Card.Header borderRadius="$2" maxHeight="75%">
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
                                        <View>
                                            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                                                <SimpleGrid
                                                    data={sortJsonArray(filteredCards, 'title', 'des')}
                                                    listKey='card'
                                                    renderItem={({ item }) => (
                                                        <Link href={{ pathname: '/pdf/[id]', params: { id: item.id as number, title: item.title as string, path: item.path as string } }}>
                                                            <Card size="$2" key={item.id} width={100} height={150} padding="$1">
                                                                <Card.Header borderRadius="$2" maxHeight="75%">
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
                                    )
                                // {isChecked ? item.title.slice(0, -4) : item.title}
                            ) : (
                                order === 'ascending' ? (
                                    <View paddingTop="$5">
                                        <FlatList
                                            data={sortJsonArray(filteredCards, 'title', 'asc')}
                                            renderItem={({ item }) =>
                                                <List.Item
                                                    onPress={() => { router.push({ pathname: '/pdf/[id]', params: { id: item.id as number, title: item.title as string, path: item.path as string } }) }}
                                                    title={item.title}
                                                    left={props => <List.Icon {...props} icon="file-pdf-box" />}
                                                />}
                                            keyExtractor={item => item.id}
                                        />
                                    </View>
                                ) : (
                                    <View paddingTop="$5">
                                        <FlatList
                                            data={sortJsonArray(filteredCards, 'title', 'des')}
                                            renderItem={({ item }) =>
                                                <List.Item
                                                    onPress={() => { router.push({ pathname: '/pdf/[id]', params: { id: item.id as number, title: item.title as string, path: item.path as string } }) }}
                                                    title={item.title}
                                                    left={props => <List.Icon {...props} icon="file-pdf-box" />}
                                                />}
                                            keyExtractor={item => item.id}
                                        />
                                    </View>
                                )
                            )
                        )}

                    <AnimatedFAB
                        visible
                        icon={"cube-scan"}
                        label={"Scan Document"}
                        style={{ bottom: 16, right: 16, position: 'absolute' }}
                        extended
                        animateFrom='right'
                        iconMode='dynamic'
                        onPress={() => { router.push('/scanner') }}
                    />
                </View>
            </YStack>
        </SafeAreaView >
    );
}

export function NavigationBar({ route, options }) {
    const title = getHeaderTitle(options, route.name)
    const [visible, setVisible] = React.useState(false)
    const openMenu = () => setVisible(true)
    const closeMenu = () => setVisible(false)

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
                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom moveOnKeyboardChange snapPointsMode='percent' snapPoints={[15, 30]}>
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
    );
}