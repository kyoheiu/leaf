interface FooterProps {
  isLast: boolean;
}

export default function Footer({ isLast }: FooterProps) {
  return <footer>{isLast ? "end of the list." : ""}</footer>;
}
