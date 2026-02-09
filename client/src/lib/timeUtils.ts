/**
 * 분 단위 시간을 "X시간 Y분" 형식으로 변환
 * @param minutes 총 분
 * @returns "X시간 Y분" 형식의 문자열
 */
export function formatMinutesToHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}분`;
  }
  
  if (mins === 0) {
    return `${hours}시간`;
  }
  
  return `${hours}시간 ${mins}분`;
}

/**
 * "X시간 Y분" 형식을 분 단위로 변환
 * @param timeString "X시간 Y분" 형식의 문자열
 * @returns 총 분
 */
export function parseHoursAndMinutesToMinutes(timeString: string): number {
  const hourMatch = timeString.match(/(\d+)시간/);
  const minMatch = timeString.match(/(\d+)분/);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const mins = minMatch ? parseInt(minMatch[1]) : 0;
  
  return hours * 60 + mins;
}
