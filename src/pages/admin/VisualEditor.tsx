import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Undo, Redo, Eye, Smartphone, Monitor, Tablet,
  Type, Image, Square, Layout, Layers, Settings, Trash2, Copy,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Plus, Minus, Move, Palette, Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface EditorElement {
  id: string;
  type: "text" | "image" | "button" | "section" | "card";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  bgColor?: string;
  textColor?: string;
  borderRadius?: number;
}

const VisualEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pageName = searchParams.get("page") || "homepage";

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<EditorElement[]>(() => {
    const saved = localStorage.getItem(`asirex_editor_${pageName}`);
    return saved ? JSON.parse(saved) : [
      { id: "hero-title", type: "text", content: "Building the New Future", x: 50, y: 100, width: 500, height: 60, fontSize: 48, fontWeight: "bold", textAlign: "center", textColor: "#ffffff" },
      { id: "hero-subtitle", type: "text", content: "ASIREX - Ahead of Time", x: 50, y: 170, width: 500, height: 30, fontSize: 18, textAlign: "center", textColor: "#a0a0a0" },
      { id: "cta-button", type: "button", content: "Explore Products", x: 200, y: 230, width: 200, height: 50, bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: 8 },
    ];
  });

  const [history, setHistory] = useState<EditorElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const selectedEl = elements.find(el => el.id === selectedElement);

  const addToHistory = (newElements: EditorElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const addElement = (type: EditorElement["type"]) => {
    const newElement: EditorElement = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === "text" ? "New Text" : type === "button" ? "Button" : type === "image" ? "/placeholder.svg" : "Section",
      x: 100,
      y: 300,
      width: type === "section" ? 400 : type === "card" ? 300 : 200,
      height: type === "section" ? 200 : type === "card" ? 150 : 50,
      fontSize: type === "text" ? 16 : undefined,
      bgColor: type === "button" ? "#3b82f6" : type === "section" ? "#1f2937" : type === "card" ? "#374151" : undefined,
      textColor: "#ffffff",
      borderRadius: 8,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
    toast.success(`${type} added`);
  };

  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
    toast.success("Element deleted");
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      const newElement = { ...el, id: `${el.type}-${Date.now()}`, x: el.x + 20, y: el.y + 20 };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(newElement.id);
      toast.success("Element duplicated");
    }
  };

  const saveChanges = () => {
    localStorage.setItem(`asirex_editor_${pageName}`, JSON.stringify(elements));
    toast.success("Changes saved!");
  };

  const getViewportWidth = () => {
    if (viewport === "mobile") return 375;
    if (viewport === "tablet") return 768;
    return 1200;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Toolbar */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/ceo")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold capitalize">Editing: {pageName.replace("-", " ")}</h1>
              <p className="text-xs text-muted-foreground">Visual Page Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button variant={viewport === "desktop" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewport("desktop")}>
                <Monitor className="w-4 h-4" />
              </Button>
              <Button variant={viewport === "tablet" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewport("tablet")}>
                <Tablet className="w-4 h-4" />
              </Button>
              <Button variant={viewport === "mobile" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewport("mobile")}>
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex === 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex === history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button variant="ghost" size="icon" onClick={() => window.open("/", "_blank")}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button onClick={saveChanges} className="gap-2 bg-green-500 hover:bg-green-600">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements */}
        <aside className="w-64 bg-card border-r border-border p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Elements
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: "text" as const, icon: Type, label: "Text" },
              { type: "button" as const, icon: Square, label: "Button" },
              { type: "image" as const, icon: Image, label: "Image" },
              { type: "section" as const, icon: Layout, label: "Section" },
              { type: "card" as const, icon: Grid3X3, label: "Card" },
            ].map(item => (
              <Button
                key={item.type}
                variant="outline"
                className="flex flex-col items-center gap-2 h-20 hover:bg-primary/10 hover:border-primary"
                onClick={() => addElement(item.type)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Layers
            </h3>
            <div className="space-y-1">
              {elements.map(el => (
                <button
                  key={el.id}
                  onClick={() => setSelectedElement(el.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    selectedElement === el.id ? "bg-primary/20 text-primary" : "hover:bg-muted"
                  }`}
                >
                  {el.type === "text" && <Type className="w-4 h-4" />}
                  {el.type === "button" && <Square className="w-4 h-4" />}
                  {el.type === "image" && <Image className="w-4 h-4" />}
                  {el.type === "section" && <Layout className="w-4 h-4" />}
                  {el.type === "card" && <Grid3X3 className="w-4 h-4" />}
                  <span className="truncate">{el.content.slice(0, 20)}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-muted/50 overflow-auto p-8 flex items-start justify-center">
          <div
            className="relative bg-background border border-border rounded-lg shadow-xl transition-all duration-300"
            style={{ width: getViewportWidth(), minHeight: 600 }}
          >
            {elements.map(el => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  updateElement(el.id, {
                    x: Math.max(0, el.x + info.offset.x),
                    y: Math.max(0, el.y + info.offset.y),
                  });
                }}
                onClick={() => setSelectedElement(el.id)}
                className={`absolute cursor-move transition-shadow ${
                  selectedElement === el.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                }}
              >
                {el.type === "text" && (
                  <div
                    style={{
                      fontSize: el.fontSize,
                      fontWeight: el.fontWeight,
                      textAlign: el.textAlign as any,
                      color: el.textColor,
                    }}
                    className="w-full h-full flex items-center"
                  >
                    {el.content}
                  </div>
                )}
                {el.type === "button" && (
                  <div
                    style={{
                      backgroundColor: el.bgColor,
                      color: el.textColor,
                      borderRadius: el.borderRadius,
                    }}
                    className="w-full h-full flex items-center justify-center font-medium"
                  >
                    {el.content}
                  </div>
                )}
                {el.type === "image" && (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {(el.type === "section" || el.type === "card") && (
                  <div
                    style={{
                      backgroundColor: el.bgColor,
                      borderRadius: el.borderRadius,
                    }}
                    className="w-full h-full flex items-center justify-center text-muted-foreground"
                  >
                    {el.content}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-72 bg-card border-l border-border p-4 overflow-y-auto">
          {selectedEl ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Properties
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateElement(selectedEl.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteElement(selectedEl.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Content</Label>
                    <Input
                      value={selectedEl.content}
                      onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input
                        type="number"
                        value={selectedEl.width}
                        onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height</Label>
                      <Input
                        type="number"
                        value={selectedEl.height}
                        onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">X Position</Label>
                      <Input
                        type="number"
                        value={selectedEl.x}
                        onChange={(e) => updateElement(selectedEl.id, { x: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y Position</Label>
                      <Input
                        type="number"
                        value={selectedEl.y}
                        onChange={(e) => updateElement(selectedEl.id, { y: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4 mt-4">
                  {selectedEl.type === "text" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Font Size</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider
                            value={[selectedEl.fontSize || 16]}
                            onValueChange={([v]) => updateElement(selectedEl.id, { fontSize: v })}
                            min={8}
                            max={72}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm w-8">{selectedEl.fontSize}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Font Weight</Label>
                        <div className="flex gap-1 mt-1">
                          {["normal", "medium", "semibold", "bold"].map(w => (
                            <Button
                              key={w}
                              variant={selectedEl.fontWeight === w ? "secondary" : "outline"}
                              size="sm"
                              className="flex-1 text-xs capitalize"
                              onClick={() => updateElement(selectedEl.id, { fontWeight: w })}
                            >
                              {w.slice(0, 1).toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Text Align</Label>
                        <div className="flex gap-1 mt-1">
                          <Button variant={selectedEl.textAlign === "left" ? "secondary" : "outline"} size="icon" className="flex-1" onClick={() => updateElement(selectedEl.id, { textAlign: "left" })}>
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button variant={selectedEl.textAlign === "center" ? "secondary" : "outline"} size="icon" className="flex-1" onClick={() => updateElement(selectedEl.id, { textAlign: "center" })}>
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button variant={selectedEl.textAlign === "right" ? "secondary" : "outline"} size="icon" className="flex-1" onClick={() => updateElement(selectedEl.id, { textAlign: "right" })}>
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Text Color
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={selectedEl.textColor || "#ffffff"}
                        onChange={(e) => updateElement(selectedEl.id, { textColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={selectedEl.textColor || "#ffffff"}
                        onChange={(e) => updateElement(selectedEl.id, { textColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {(selectedEl.type === "button" || selectedEl.type === "section" || selectedEl.type === "card") && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Background Color
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={selectedEl.bgColor || "#3b82f6"}
                          onChange={(e) => updateElement(selectedEl.id, { bgColor: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={selectedEl.bgColor || "#3b82f6"}
                          onChange={(e) => updateElement(selectedEl.id, { bgColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {(selectedEl.type === "button" || selectedEl.type === "section" || selectedEl.type === "card") && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Border Radius</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Slider
                          value={[selectedEl.borderRadius || 0]}
                          onValueChange={([v]) => updateElement(selectedEl.id, { borderRadius: v })}
                          min={0}
                          max={50}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm w-8">{selectedEl.borderRadius}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Move className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select an element to edit its properties</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default VisualEditor;
