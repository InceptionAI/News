type LogoItem = {
  src: string;
  aspectRatio?: number; // 1 à ..., default 1
};

export type StorageType = {
  icon: {
    facebook?: LogoItem;
    instagram?: LogoItem;
    X?: LogoItem;
  };
  logo: {
    navbar?: LogoItem;
    square?: LogoItem;
    map?: LogoItem;
    logoTitle?: LogoItem;
  };
  backgroundImageDark?: LogoItem;
  backgroundImageLight?: LogoItem;
  header?: LogoItem;
};

export const storageLocal108: StorageType = {
  icon: {
    facebook: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/images%2Fsocial-media%2Ffacebook.png?alt=media&token=440f1bb2-e1d3-4b96-bce2-4d6fe90336ed",
    },
    instagram: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/images%2Fsocial-media%2Finstagram.png?alt=media&token=c80b7de6-bbf8-4b55-bb27-e0dd85439ac2",
    },
    X: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/images%2Fsocial-media%2FX.png?alt=media&token=36d44823-2343-4308-a178-a7ad3a9fd434",
    }
  },
  logo: {
    navbar: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2Fcompagny-logo.png?alt=media&token=5476600d-8963-41ce-a3be-a792ae4cc3e7",
      aspectRatio: 2,
    },
    square: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2Flogo-navbar.png?alt=media&token=a9f09717-ea51-46e9-bbf3-d54cc0997d6a",
      aspectRatio: 1.5,
    },
    map: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2FCapture%20d’écran%2C%20le%202024-05-22%20à%2020.41.08.png?alt=media&token=40104345-ab2e-4170-b181-c92c65701080",
      aspectRatio: 1,
    },
    logoTitle: {
      src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2Ftitle-logo.png?alt=media&token=32625c40-22f7-44aa-95ba-e283adffe1dc",
      aspectRatio: 1,
    },
  },
  backgroundImageDark: {
    src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2Fpeople-health-meditation-yoga-733396b43f344632093a30c39719befa.jpg?alt=media&token=ade5123a-6c18-4037-b69b-064fb3b3a5c1",
  },
  backgroundImageLight: {
    src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2F1171166-yoga-desktop-wallpaper-1920x1080-for-samsung.jpg?alt=media&token=ad35c853-62b9-4360-81a3-d4f240fc07a9",
  },

  header: {
    src: "https://firebasestorage.googleapis.com/v0/b/wonkasite-d43b5.appspot.com/o/local-108%2Ftitle-logo-notext.png?alt=media&token=634f6948-e9d0-48ff-8c22-5fd51a8e9e88",
    aspectRatio: 1.3,
  },
};
