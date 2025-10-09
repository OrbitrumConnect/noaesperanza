import { FC } from 'react';

interface EscuteSeCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const EscuteSeCard: FC<EscuteSeCardProps> = ({ title, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border border-muted p-6 rounded-lg shadow-sm hover:shadow-md transition"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default EscuteSeCard;
