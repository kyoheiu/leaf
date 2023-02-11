interface FooterProps {
  isLast: boolean;
}

export default function Footer({ isLast }: FooterProps) {
  return <footer>{isLast ? "End of the list." : ""}</footer>;
}
