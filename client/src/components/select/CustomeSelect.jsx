import React from "react";
import { Select } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./select.css";
import { Controller } from "react-hook-form";

const CustomSelect = ({
  name,
  control,
  rules,
  label,
  options = [], // Array of select options
  defaultValue = "",
  placeholder = "Please select",
  showErrorIcon = true,
  style,
  onChange,
  mode,
  seperator
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue || undefined}
      render={({ field, fieldState: { error } }) => (
        <>
          <Select
            mode={mode}
            tokenSeparators={seperator}
            {...field}
            showSearch
            // onSearch={handleSeacrh}
            filterOption={(input, option) => {
              return option.label.toLowerCase().includes(input.toLowerCase());
            }}
            placeholder={placeholder}
            className={`custom-select  ${error ? "error" : ""}`}
            options={options}
            style={style}
            allowClear
            onChange={(value) => {
              field.onChange(value);
              onChange && onChange(value);
            }}
          />
          {error && (
            <span
              style={{
                color: "red",
                display: "flex",
                alignItems: "center",
                marginTop: "5px",
              }}
            >
              {showErrorIcon && (
                <InfoCircleOutlined style={{ marginRight: 5 }} />
              )}
              {error.message}
            </span>
          )}
        </>
      )}
    />
  );
};

export default CustomSelect;

