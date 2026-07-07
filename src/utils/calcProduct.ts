
// TODO: implement after ProductLogistics interface is finalized
// // Calculation of the volume of a single product unit and a box in cubic meters (m³)
// export function calcUnitVolumeCbm(logistics: ProductLogistics): number | null {
// 	if (!logistics.unitLengthCm || !logistics.unitWidthCm || !logistics.unitHeightCm) return null;
// 	return (logistics.unitLengthCm * logistics.unitWidthCm * logistics.unitHeightCm) / 1_000_000; // Convert cm³ to m³
// }
//
// export function calcBoxVolumeCbm(logistics: ProductLogistics): number | null {
// 	if (!logistics.boxLengthCm || !logistics.boxWidthCm || !logistics.boxHeightCm) return null;
// 	return (logistics.boxLengthCm * logistics.boxWidthCm * logistics.boxHeightCm) / 1_000_000; // Convert cm³ to m³
// }

// Calculation of the product box weight
// export function calcBoxWeightKg(logistics: ProductLogistics): number | null {
// 	if (!logistics.unitWeightKg || !logistics.unitsPerBox) return null;
// 	return logistics.unitWeightKg * logistics.unitsPerBox;
// }