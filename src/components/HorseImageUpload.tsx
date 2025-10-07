import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HorseImageUploadProps {
  horseId: string;
  currentImageUrl?: string | null;
  onImageUpdated: () => void;
}

export const HorseImageUpload = ({
  horseId,
  currentImageUrl,
  onImageUpdated,
}: HorseImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Fel filtyp",
          description: "Vänligen välj en bildfil",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Filen är för stor",
          description: "Maximal filstorlek är 10MB",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete old image if exists
      if (currentImageUrl) {
        const oldPath = currentImageUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("horse-images")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${horseId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("horse-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("horse-images")
        .getPublicUrl(filePath);

      // Update horse record
      const { error: updateError } = await supabase
        .from("horses")
        .update({ image_url: publicUrl })
        .eq("id", horseId);

      if (updateError) throw updateError;

      toast({
        title: "Bild uppladdad!",
        description: "Hästens bild har uppdaterats",
      });

      setOpen(false);
      onImageUpdated();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Fel vid uppladdning",
        description: "Kunde inte ladda upp bilden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setUploading(true);

      if (!currentImageUrl) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete from storage
      const oldPath = currentImageUrl.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("horse-images")
          .remove([`${user.id}/${oldPath}`]);
      }

      // Update horse record
      const { error: updateError } = await supabase
        .from("horses")
        .update({ image_url: null })
        .eq("id", horseId);

      if (updateError) throw updateError;

      toast({
        title: "Bild borttagen",
        description: "Hästens bild har tagits bort",
      });

      setOpen(false);
      onImageUpdated();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort bilden",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <Camera className="w-4 h-4 mr-2" />
          {currentImageUrl ? "Byt bild" : "Lägg till bild"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hästens bild</DialogTitle>
          <DialogDescription>
            Ladda upp en bild på din häst (max 10MB)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label htmlFor="horse-image" className="cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Klicka för att välja en bild
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG eller WebP (max 10MB)
                </p>
              </div>
              <input
                id="horse-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>

            {currentImageUrl && (
              <Button
                variant="destructive"
                onClick={handleDeleteImage}
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Ta bort nuvarande bild
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
