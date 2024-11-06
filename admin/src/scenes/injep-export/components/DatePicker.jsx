import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("fr", fr);
import cx from "classnames";

function MyDatePicker({ dateKey, onChangeDate, isOpen = false, onClose, minDate = undefined, maxDate = undefined }) {
  return (
    <div
      className={cx("flex absolute top-[32%]", {
        "left-[28%]": dateKey === "cohesionCenters",
        "left-[52%]": dateKey === "youngsBeforeSession",
        "left-[79%]": dateKey === "youngsAfterSession",
      })}>
      <div>
        <DatePicker
          minDate={minDate}
          maxDate={maxDate}
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
