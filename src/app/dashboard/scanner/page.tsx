"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Search, RotateCcw, CheckCircle, AlertCircle, Database, Receipt, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";

interface ScannedCard {
  id: string;
  name: string;
  set: string;
  rarity: string;
  condition: string;
  price: number;
  confidence: number;
  imageUrl: string;
  timestamp: Date;
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCards, setScannedCards] = useState<ScannedCard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("camera");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock AI scanning function
  const scanCard = useCallback(async (imageData: string) => {
    setIsScanning(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock card recognition result
    const mockCards: ScannedCard[] = [
      {
        id: `card-${Date.now()}-1`,
        name: "Monkey D. Luffy",
        set: "OP06 - Awakening of the New Era",
        rarity: "Leader",
        condition: "NM",
        price: 15.99,
        confidence: 0.95,
        imageUrl: imageData,
        timestamp: new Date(),
      },
      {
        id: `card-${Date.now()}-2`,
        name: "Roronoa Zoro",
        set: "OP06 - Awakening of the New Era",
        rarity: "SR",
        condition: "LP",
        price: 8.50,
        confidence: 0.87,
        imageUrl: imageData,
        timestamp: new Date(),
      },
    ];

    setScannedCards(prev => [...mockCards, ...prev]);
    setIsScanning(false);
    toast.success("Cards scanned successfully!", {
      description: `Found ${mockCards.length} cards with high confidence.`,
    });
  }, []);

  const handleCameraScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Capture frame from video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg");
    await scanCard(imageData);
  }, [scanCard]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await scanCard(imageData);
    };
    reader.readAsDataURL(file);
  }, [scanCard]);

  const handleManualSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockCard: ScannedCard = {
      id: `card-${Date.now()}`,
      name: searchQuery,
      set: "Manual Search",
      rarity: "Unknown",
      condition: "NM",
      price: 0,
      confidence: 1.0,
      imageUrl: "",
      timestamp: new Date(),
    };

    setScannedCards(prev => [mockCard, ...prev]);
    setIsScanning(false);
    setSearchQuery("");
    toast.success("Card found!", {
      description: "Card added to scanned results.",
    });
  }, [searchQuery]);

  const filteredCards = scannedCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.set.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Card Scanner</h1>
          <p className="text-muted-foreground">
            AI-powered card recognition for quick inventory management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {scannedCards.length} cards scanned
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Cards</CardTitle>
            <CardDescription>
              Use your camera or upload images to identify cards instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="camera">Camera</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>

              <TabsContent value="camera" className="space-y-4">
                <div className="relative aspect-video rounded-lg border bg-muted">
                  <video
                    ref={videoRef}
                    className="h-full w-full rounded-lg object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg border-2 border-dashed border-primary/50 bg-background/80 p-4 text-center">
                      <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Camera feed will appear here
                      </p>
                    </div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button 
                  onClick={handleCameraScan}
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Scan Current Frame
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload card images for AI recognition
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="mt-4"
                    disabled={isScanning}
                  />
                </div>
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search for a card</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="Enter card name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                    />
                    <Button 
                      onClick={handleManualSearch}
                      disabled={isScanning || !searchQuery.trim()}
                    >
                      {isScanning ? (
                        <RotateCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Scanned Results */}
        <Card>
          <CardHeader>
            <CardTitle>Scanned Results</CardTitle>
            <CardDescription>
              Recently scanned cards and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCards.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No cards scanned yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the scanner to identify cards
                  </p>
                </div>
              ) : (
                filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="relative">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="h-16 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-16 w-12 rounded bg-muted flex items-center justify-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <Badge
                        variant={card.confidence > 0.9 ? "default" : "secondary"}
                        className="absolute -top-1 -right-1 text-xs"
                      >
                        {Math.round(card.confidence * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{card.name}</h3>
                        {card.confidence > 0.9 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{card.set}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline">{card.rarity}</Badge>
                        <Badge variant="outline">{card.condition}</Badge>
                        {card.price > 0 && (
                          <span className="font-medium">${card.price}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Add to Inventory
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for scanned cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Database className="h-6 w-6" />
              <span>Add to Inventory</span>
              <span className="text-xs text-muted-foreground">
                {scannedCards.length} cards ready
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Receipt className="h-6 w-6" />
              <span>Create Transaction</span>
              <span className="text-xs text-muted-foreground">
                Sell scanned cards
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span>Start Buylist</span>
              <span className="text-xs text-muted-foreground">
                Buy cards from customers
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 