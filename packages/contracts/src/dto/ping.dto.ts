export interface PingResponseDto {
    status: 'ok';
    service: string;
    time: string;
    slice?: number;
}