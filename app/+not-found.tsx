import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack } from 'expo-router'
import { View, Separator, Text, H2, Paragraph, Button, XStack, YStack, Square } from 'tamagui'
import { Image } from 'expo-image'

export default function NotFoundScreen() {
  return (
    <>
      <SafeAreaView>
        <Stack.Screen options={{ headerShown: false, title: 'Page Not Found' }} />
        <View padding="$5" flexDirection='column' justifyContent='center' alignContent='center'>
          <Square>
            <Image source={require('../assets/images/not-found.svg')} cachePolicy='memory' contentFit='contain' width="120%" height="70%" scale />
          </Square>

          <H2 paddingBottom="$3">Page Not Found.</H2>
          <Paragraph size="$5" fontWeight="600">Sorry, we can't find that page. You'll find lots to explore on the home page. If you think this page should've been there, <Link asChild href="/about"><Text fontWeight={800}>inform us</Text></Link> about this</Paragraph>
          <Separator marginVertical={15} />
          <Link href="/" asChild><Button>Back to Homepage</Button></Link>
        </View>
      </SafeAreaView>
    </>
  );
}
