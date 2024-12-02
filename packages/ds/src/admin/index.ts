/** @format */

// Form
import InputText from "./form/InputText";
import InputNumber from "./form/InputNumber";
import InputPhone from "./form/InputPhone";
export { default as InputFile } from "./form/InputFile";
import Label from "./form/Label";
import Select from "./form/Select/Select";
export { default as CollapsableSelectSwitcher } from "./form/CollapsableSelectSwitcher";
export { default as SectionSwitcher } from "./form/SectionSwitcher";

// Layout
import Container from "./layout/Container";
import Header from "./layout/Header";
import Breadcrumbs from "./layout/Breadcrumbs";
import Page from "./layout/Page";
import Subheader from "./layout/Subheader";
import Navbar from "./layout/Navbar";
import NavbarControlled from "./layout/NavbarControlled";
export { default as DataTable } from "./layout/DataTable/DataTable";

// UI
export { default as Badge } from "./ui/Badge";
export type { TBadgeStatus } from "./ui/Badge";
import BadgeNotif from "./ui/BadgeNotif";
import Button from "./ui/Button";
import DropdownButton from "./ui/DropdownButton";
import Modal from "./ui/Modal";
import ModalConfirmation from "./ui/ModalConfirmation";
export { default as Collapsable } from "./ui/Collapsable";
export { default as Tooltip } from "./ui/Tooltip";

export {
  // Form
  InputText,
  InputNumber,
  InputPhone,
  Label,

  // Layout
  Container,
  Header,
  Breadcrumbs,
  Page,
  Subheader,
  Navbar,
  NavbarControlled,

  // UI
  BadgeNotif,
  Button,
  DropdownButton,
  Modal,
  ModalConfirmation,
  Select,
};
