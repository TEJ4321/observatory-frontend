import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Camera, Video } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CameraFeedsProps {
  telescopeCameraUrl: string;
  cctvCameraUrl: string;
  lastExposure: {
    duration: number;
    filter: string;
    timestamp: string;
  } | null;
}

export function CameraFeeds({ telescopeCameraUrl, cctvCameraUrl, lastExposure }: CameraFeedsProps) {
  return (
    <Card className="p-4 md:p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-primary" />
        <h3>Camera Feeds</h3>
      </div>
      
      <Tabs defaultValue="cctv">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cctv">
            <Video className="w-4 h-4 mr-2" />
            CCTV Camera
          </TabsTrigger>
          <TabsTrigger value="telescope">
            <Camera className="w-4 h-4 mr-2" />
            Telescope Camera
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cctv" className="mt-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
            <ImageWithFallback 
              src={cctvCameraUrl}
              alt="CCTV Feed"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-sm bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
              <span>Observatory Wide View</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="telescope" className="mt-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
            <ImageWithFallback 
              src={telescopeCameraUrl}
              alt="Telescope Camera Feed"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="default">Last Exposure</Badge>
            </div>
            {lastExposure && (
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs sm:text-sm bg-black/50 px-3 py-2 rounded backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <div className="opacity-70">Duration</div>
                    <div>{lastExposure.duration}s</div>
                  </div>
                  <div>
                    <div className="opacity-70">Filter</div>
                    <div>{lastExposure.filter}</div>
                  </div>
                  <div>
                    <div className="opacity-70">Time</div>
                    <div>{new Date(lastExposure.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
