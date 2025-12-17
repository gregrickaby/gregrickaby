export type IconModalItem = {
  name: string;
  url: string;
  icon: string;
};

export type IconModalProps = {
  items: IconModalItem[];
  buttonText: string;
  modalTitle: string;
};
