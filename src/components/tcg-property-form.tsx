"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  TCG_PROPERTY_RULES, 
  getFieldLabel, 
  getFieldPlaceholder, 
  getTCGDisplayName,
  type TCGLines 
} from "~/lib/tcg-properties";

interface TCGPropertyFormProps {
  tcgLine: TCGLines;
  attributes: Record<string, unknown>;
  onChange: (attributes: Record<string, unknown>) => void;
  className?: string;
}

export function TCGPropertyForm({ tcgLine, attributes, onChange, className }: TCGPropertyFormProps) {
  const rules = TCG_PROPERTY_RULES[tcgLine];
  
  if (!rules) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Unsupported TCG: {tcgLine}
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateAttribute = (field: string, value: unknown) => {
    onChange({ ...attributes, [field]: value });
  };

  const renderField = (field: string, isRequired = false) => {
    const label = getFieldLabel(field);
    const placeholder = getFieldPlaceholder(field, tcgLine);
    const value = attributes[field] as string | number | undefined;

    // Handle special field types
    if (field === "subtypes") {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={field}
            value={Array.isArray(value) ? value.join(", ") : ""}
            onChange={(e) => updateAttribute(field, e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder={placeholder}
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple subtypes with commas
          </p>
        </div>
      );
    }

    if (field === "cardText" || field === "effect" || field === "mtgFlavorText" || field === "flavorText") {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={field}
            value={value as string || ""}
            onChange={(e) => updateAttribute(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
      );
    }

    // Handle select fields
    if (field === "cardType" && tcgLine === "One Piece TCG") {
      const cardTypes = ["Leader", "Character", "Event", "Stage"];
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value as string || ""} onValueChange={(val) => updateAttribute(field, val)}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {cardTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field === "mtgCardType" && tcgLine === "Magic The Gathering") {
      const cardTypes = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land"];
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value as string || ""} onValueChange={(val) => updateAttribute(field, val)}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {cardTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field === "pokemonType" && tcgLine === "Pokemon TCG") {
      const pokemonTypes = ["Fire", "Water", "Grass", "Electric", "Psychic", "Fighting", "Darkness", "Metal", "Fairy", "Colorless"];
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select value={value as string || ""} onValueChange={(val) => updateAttribute(field, val)}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {pokemonTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Default input field
    const inputType = typeof value === "number" || field === "cost" || field === "power" || field === "counter" || field === "manaValue" || field === "hp" || field === "retreatCost" ? "number" : "text";
    
    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field}>
          {label} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={field}
          type={inputType}
          value={value as string | number || ""}
          onChange={(e) => {
            const val = inputType === "number" ? parseInt(e.target.value) || 0 : e.target.value;
            updateAttribute(field, val);
          }}
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{getTCGDisplayName(tcgLine)} Properties</CardTitle>
        <CardDescription>
          Configure card-specific properties for {getTCGDisplayName(tcgLine)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Fields */}
        {rules.required.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Required Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.required.map(field => renderField(field, true))}
            </div>
          </div>
        )}

        {/* Optional Fields */}
        {rules.optional.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Optional Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.optional.map(field => renderField(field, false))}
            </div>
          </div>
        )}

        {/* Common Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Common Fields</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("artist", false)}
            {renderField("cardText", false)}
            {renderField("flavorText", false)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component to show field requirements
export function TCGFieldRequirements({ tcgLine }: { tcgLine: TCGLines }) {
  const rules = TCG_PROPERTY_RULES[tcgLine];
  
  if (!rules) return null;

  return (
    <div className="text-sm text-muted-foreground space-y-1">
      <p><strong>Required:</strong> {rules.required.join(", ")}</p>
      {rules.optional.length > 0 && (
        <p><strong>Optional:</strong> {rules.optional.join(", ")}</p>
      )}
    </div>
  );
} 