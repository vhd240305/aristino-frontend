import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center bg-mist px-6 py-16 text-center">
      {Icon && <Icon size={44} strokeWidth={1.2} className="text-ink-soft" />}
      <h2 className="mt-5 text-lg font-bold uppercase tracking-wide">{title}</h2>
      {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{text}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-7">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
