// CustomToolbar.jsx
import React from "react";

const CustomToolbar = () => {
  return (
    <div id="toolbar" className="flex flex-wrap gap-2 p-2 border-b bg-gray-50 rounded-t-lg">
      {/* Headers */}
      <select className="ql-header border rounded p-1">
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
        <option selected></option>
      </select>

      {/* Basic text styles */}
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-strike" />

      {/* Lists */}
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <button className="ql-indent" value="-1" />
      <button className="ql-indent" value="+1" />

      {/* Alignment */}
      <select className="ql-align border rounded p-1" />

      {/* Script */}
      <button className="ql-script" value="sub" />
      <button className="ql-script" value="super" />

      {/* Colors */}
      <select className="ql-color border rounded p-1" />
      <select className="ql-background border rounded p-1" />

      {/* Links, Images, Video */}
      <button className="ql-link" />
      <button className="ql-image" />
      <button className="ql-video" />

      {/* Code + Clean */}
      <button className="ql-code-block" />
      <button className="ql-clean" />
    </div>
  );
};

export default CustomToolbar;
