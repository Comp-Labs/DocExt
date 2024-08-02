import type ThumbnailResult from "react-native-pdf-thumbnail"

interface File {
    id: number;
    title: string;
    path: string;
    thumbnail: ThumbnailResult | undefined;
}

export const fileList: File[] = [];