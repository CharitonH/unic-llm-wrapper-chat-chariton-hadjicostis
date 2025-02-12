export default function MinimalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
return (
    <html lang="en">
    <body style={{ backgroundColor: '#111', color: '#fff', margin: 0 }}>
        {children}
    </body>
    </html>
    );
}  