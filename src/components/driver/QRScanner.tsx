import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (rawValue: string) => void;
  onClose: () => void;
}

const CONTAINER_ID = "qr-reader";

export function QRScanner({ onScan, onClose }: QRScannerProps) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
		const scanner = new Html5Qrcode(CONTAINER_ID);
		scannerRef.current = scanner;
		
		scanner
			.start(
				{facingMode: "environment" },    // задня камера
				{ fps: 10, qrbox: 250 },
				(decodedText) => onScan(decodedText),
				() => {},   // помилки розпізнавання окремого кадру — норма, ігноруємо
		)
			.catch(() => setError("Не вдалося увімкнути камеру — перевір дозвіл у браузері"));
		
		// Cleanup — зупиняємо камеру при закритті/розмонтуванні компонента,
		// інакше вона лишиться увімкненою у фоні
		return () => {
			scannerRef.current?.stop().catch(() => {});
		};
	}, [onScan]);
	
	return (
		<div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
			<div id={CONTAINER_ID} className="w-full max-w-sm rounded-xl overflow-hidden" />
			{error && <p className="text-red-300 text-sm mt-3 text-center">{error}</p>}
			<button
				onClick={onClose}
				className="mt-5 px-4 py-2 text-sm text-white/70 underline underline-offset-4"
			>
				Закрити
			</button>
		</div>
	);
}
