export function CampusInfoPanel({
    campus,
}: {
    campus: {
        subtitle: string;
        address: string;
    };
}) {
    return (
        <div className="space-y-1">
            <p className="text-zinc-600">{campus.subtitle}</p>
            <p className="pt-2 text-xs text-zinc-500">{campus.address}</p>
        </div>
    );
}