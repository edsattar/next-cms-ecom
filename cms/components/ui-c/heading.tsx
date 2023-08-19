interface Props {
  title: string;
  description: string;
}

export const Heading = ({ title, description }: Props) => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
