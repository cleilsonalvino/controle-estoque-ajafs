
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiPublic } from '@/lib/api'; // Usando a instância pública da API
import { toast } from 'sonner';

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    setLoading(true);
    try {
      await apiPublic.post(`/feedback/${id}`, {
        nota: rating,
        comentario: comment,
      });
      setSubmitted(true);
      toast.success('Feedback enviado com sucesso. Agradecemos sua contribuição!');
    } catch (error) {
      toast.error('Erro ao enviar feedback. Por favor, tente novamente mais tarde.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Obrigado!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sua opinião é muito importante para nós e nos ajuda a melhorar sempre.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="mb-6 text-center">
            <img src="/logo.png" alt="Logo da Empresa" className="h-16 mx-auto mb-4" />
        </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Como foi sua experiência conosco?</CardTitle>
          <CardDescription>Sua opinião nos ajuda a crescer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-10 w-10 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="comment" className="font-medium">Deixe um comentário (opcional):</label>
            <Textarea
              id="comment"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading || rating === 0} className="w-full">
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
