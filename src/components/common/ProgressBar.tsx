export default function ProgressBar({ value }: { value: number }) {
    return (
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-3 bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
