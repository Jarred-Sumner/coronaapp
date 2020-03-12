import copy from 'copy-to-clipboard';

export const Share = {
  open: ({message, url}) => {
    const hasNativeShare = !!window?.navigator?.share;
    if (hasNativeShare) {
      return window?.navigator?.share({message, url});
    } else {
      copy(url);
      window.alert('Copied link to clipboard.');
    }
  },
};

export default Share;
