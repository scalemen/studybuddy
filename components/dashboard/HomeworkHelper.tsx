import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ExternalLink } from "lucide-react";

export function HomeworkHelper() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-amber-600" />
          Homework Helper
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Take a photo of any problem and get instant AI-powered solutions with step-by-step explanations.
        </p>
        
        <div className="space-y-3">
          <Link href="/homework-helper">
            <Button className="w-full" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Problem
            </Button>
          </Link>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-50 p-2 rounded text-center">
              <div className="font-medium text-amber-800">Math</div>
              <div className="text-amber-600">Algebra, Calculus</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="font-medium text-green-800">Science</div>
              <div className="text-green-600">Physics, Chemistry</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}