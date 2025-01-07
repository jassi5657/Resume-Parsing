import React from "react";
import { Input, Tooltip } from "antd";
import { Controller } from "react-hook-form";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./input.css";

const CustomInput = ({
  name,
  control,
  rules,
  label,
  placeholder,
  type = "text",
  defaultValue = "",
  tooltip,
  showErrorIcon = true,
  style,
  icon,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <>
          <Input
            {...field}
            placeholder={placeholder}
            type={type}
            style={style}
            prefix={icon && <span className="custom-icon">{icon}</span>}
            suffix={
              tooltip && (
                <Tooltip title={tooltip}>
                  <InfoCircleOutlined />
                </Tooltip>
              )
            }
            className={`custom-input ${error ? "error" : ""}`}
          />
          {error && (
            <span
              style={{
                color: "red",
                display: "flex",
                alignItems: "center",
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

export default CustomInput;
