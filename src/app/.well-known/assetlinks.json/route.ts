import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.bhagyalakshmifuturegold.app",
        sha256_cert_fingerprints: [
          "9E:55:81:5B:9A:F9:9B:F0:CC:96:8E:B8:40:A5:82:CB:F4:C1:31:C9:1C:02:5D:47:6D:63:13:A2:69:74:CF:78",
        ],
      },
    },
  ]);
}
