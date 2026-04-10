declare module "react-image-gallery" {
  import { Component } from "react";

  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    originalTitle?: string;
    description?: string;
    originalClass?: string;
    thumbnailClass?: string;
    renderItem?: (item: ReactImageGalleryItem) => JSX.Element;
  }

  interface ReactImageGalleryProps {
    items: ReactImageGalleryItem[];
    showFullscreenButton?: boolean;
    showPlayButton?: boolean;
    showThumbnails?: boolean;
    showNav?: boolean;
    slideInterval?: number;
    lazyLoad?: boolean;
    onSlide?: (index: number) => void;
    onClick?: (event: React.SyntheticEvent) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export default class ImageGallery extends Component<ReactImageGalleryProps> {}
}
