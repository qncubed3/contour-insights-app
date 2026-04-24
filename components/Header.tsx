export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md flex items-center justify-between px-6">
            <span
                className="text-lg font-extrabold tracking-tight"
                style={{ fontFamily: "'PolySans', sans-serif" }}
            >
                <span className="text-black">Contour</span>
                <span className="text-blue-500"> Insights</span>
            </span>
        </header>
    );
}