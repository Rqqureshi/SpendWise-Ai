import React from "react";

function initialsFromName(nameOrEmail) {
  if (!nameOrEmail) return "U";
  const parts = nameOrEmail.trim().split(" ");
  if (parts.length === 1) {
    const s = parts[0];
    return s.charAt(0).toUpperCase();
  }
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export default function Avatar({ src, name, size = 40 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "inline-block",
    overflow: "hidden",
    flex: "0 0 auto",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const initials = initialsFromName(name || "");

  return (
    <div className="avatar" style={style} title={name || "User"}>
      {src ? (
        <img src={src} alt={name || "User"} style={imgStyle} />
      ) : (
        <div className="avatar-initials" style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "white",
          fontWeight: 700,
          fontSize: Math.max(12, Math.floor(size / 2.5))
        }}>
          {initials}
        </div>
      )}
    </div>
  );
}
