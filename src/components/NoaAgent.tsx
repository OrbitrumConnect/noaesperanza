import { FC } from 'react';

interface NoaAgentProps {
  avatarUrl: string;
  name: string;
  specialty: string;
}

const NoaAgent: FC<NoaAgentProps> = ({ avatarUrl, name, specialty }) => {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm bg-white">
      <img
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        className="w-16 h-16 rounded-full border"
      />
      <div>
        <p className="text-lg font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{specialty}</p>
      </div>
    </div>
  );
};

export default NoaAgent;
