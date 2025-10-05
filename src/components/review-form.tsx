"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewFormProps {
  serviceId: string
}

export function ReviewForm({ serviceId }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          rating,
          comment: comment.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Chyba při vytváření recenze")
        return
      }

      setSuccess(true)
      setComment("")
      setRating(5)

      // Refresh the page to show the new review
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      setError("Došlo k chybě při vytváření recenze")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Napsat hodnocení</CardTitle>
        <CardDescription>
          Sdílejte svou zkušenost s touto službou
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              Hodnocení bylo úspěšně přidáno!
            </div>
          )}

          <div className="space-y-2">
            <Label>Hodnocení</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating ? "text-amber-400" : "text-gray-300"
                  } hover:text-amber-400`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Vybráno: {rating} {rating === 1 ? "hvězdička" : rating < 5 ? "hvězdičky" : "hvězdiček"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Komentář (volitelné)</Label>
            <textarea
              id="comment"
              placeholder="Popište svou zkušenost se službou..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {comment && comment.length < 10 && (
              <p className="text-sm text-muted-foreground">
                Komentář musí mít alespoň 10 znaků
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading || (comment && comment.length < 10)}>
            {isLoading ? "Odesílám..." : "Odeslat hodnocení"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
