export function StudentInfoPanel({
    student,
}: {
    student: {
        created_at: string;
        year_level: string | number;
        school_name: string;
        suburb: string;
        postcode: string;
        region: string;
        gender: string;
        grad_yr: string | number;
        address: string;
    };
}) {
    return (
        <div className="space-y-1">
            <p>
                <span className="font-medium">Created At:</span> {student.created_at}
            </p>
            <p>
                <span className="font-medium">Year:</span> {student.year_level}
            </p>
            <p>
                <span className="font-medium">School:</span> {student.school_name}
            </p>
            <p>
                <span className="font-medium">Suburb:</span> {student.suburb}
            </p>
            <p>
                <span className="font-medium">Postcode:</span> {student.postcode}
            </p>
            <p>
                <span className="font-medium">Region:</span> {student.region}
            </p>
            <p>
                <span className="font-medium">Gender:</span> {student.gender}
            </p>
            <p>
                <span className="font-medium">Graduation:</span> {student.grad_yr}
            </p>
            <p className="pt-2 text-xs text-zinc-500">
                {student.address}
            </p>
        </div>
    );
}