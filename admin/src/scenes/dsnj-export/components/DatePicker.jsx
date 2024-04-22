import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("fr", fr);

function MyDatePicker({ dateKey, onChangeDate, isOpen = false, onClose, minDate = undefined }) {
  let leftPosition = "";
  switch (dateKey) {
    case "cohesionCenters":
      leftPosition = "left-[28%]";
      break;
    case "youngsBeforeSession":
      leftPosition = "left-[50%]";
      break;
    case "youngsAfterSession":
      leftPosition = "left-[77%]";
      break;
  }
  return (
    <div className={`flex absolute top-[30%] ${leftPosition}`}>
      <div>
        <DatePicker
          minDate={minDate}
          onClickOutside={onClose}
          open={isOpen}
          locale="fr"
          onChange={(value) => {
            onChangeDate(dateKey, value);
            onClose();
          }}
          className="w-full bg-[transparent]"
          dateFormat="dd/MM/yyyy"
        />
      </div>
    </div>
  );
}

export default MyDatePicker;
