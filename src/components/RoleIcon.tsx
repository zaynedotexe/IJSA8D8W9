export default function RoleIcon({ roleId, icon, emoji, size = 14 }: { roleId: string; icon?: string | null; emoji?: string | null; size?: number }) {
  if (icon) {
    return (
      <img
        src={"https://cdn.discordapp.com/role-icons/" + roleId + "/" + icon + ".webp?size=64"}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        loading="lazy"
        style={{ width: size, height: size }}
        className="inline-block object-contain shrink-0"
      />
    );
  }
  if (emoji) {
    return (
      <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }} className="inline-block shrink-0">
        {emoji}
      </span>
    );
  }
  return null;
}
