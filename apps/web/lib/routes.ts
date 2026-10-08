import { NextResponse } from 'next/server';

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function redirect(url: string, statusCode = 307) {
  return NextResponse.redirect(new URL(url), statusCode);
}
