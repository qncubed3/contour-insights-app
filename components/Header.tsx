export function Header() {
    return (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-white pointer-events-none z-10" >
            <span className="text-xl tracking-tight" style={{ fontFamily: "'PolySans', sans-serif" }}>
                <span className="text-black font-extrabold">Contour</span>
                <span style={{ color: "#3b82f6" }} className="font-extrabold"> Insights</span>
            </span>
            <span className="text-xs text-zinc-400 hidden sm:block" style={{ fontFamily: "'PolySans', sans-serif" }}>
                deck.gl · MapLibre
            </span>
        </div>
    );
}