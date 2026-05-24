import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import clsx from 'clsx';

const heroProduct = {
    id: 'hero',
    name: 'Sacs à Main Fourrure Luxe',
    price: 1500,
    reviews: 198,
    rating: 5,
    details: {
        Marque: 'Mode Urbaine',
        Matière: 'Cuir PU matelassé',
        'Type de fermeture': 'Fermeture éclair dorée',
        Accessoires: 'Bandoulière amovible + Mini pochette',
        Dimensions: '20 cm x 15 cm x 7 cm',
    },
    about: [
        { title: 'Design Élégant et Moderne', text: "Sac à bandoulière au motif matelassé chic avec une petite pochette ronde assortie. Parfait pour un look tendance et raffiné." },
        { title: '2-en-1 Pratique', text: "Comprend un compartiment principal spacieux et une mini pochette ronde idéale pour ranger vos pièces, clés ou petits accessoires." },
        { title: 'Bandoulière Ajustable', text: "Sangle confortable et réglable pour un port à l'épaule ou en travers du corps." },
        { title: 'Matériau de Qualité', text: "Confectionné en similicuir doux avec finition matelassée durable et résistante." },
        { title: 'Disponible en Plusieurs Couleurs', text: "Marron, Rose et Vert — choisissez la couleur qui correspond à votre style." },
    ],
    extra: "Résistance à l'eau",
    colors: [
        { name: 'Sac Vert',     hex: '#008D3E', image: '/images/products/sac-main/style8.jpg' },
        { name: 'Sac Blanc',    hex: '#D6C8C0', image: '/images/products/sac-main/style2.jpg' },
        { name: 'Sac marron',   hex: '#CCA49D', image: '/images/products/sac-main/style4.jpg' },
        { name: 'Sac Rosepâle', hex: '#D1A7C4', image: '/images/products/sac-main/style5.jpg' },
    ],
    slides: [
        '/images/products/sac-main/sac6.jpeg',
        '/images/products/sac-main/style8.jpg',
        '/images/products/sac-main/style2.jpg',
        '/images/products/sac-main/style4.jpg',
        '/images/products/sac-main/style5.jpg',
    ],
};

export const HeroProduct = () => {
    const { addToCart } = useCart();
    const [selectedColor, setSelectedColor] = useState(heroProduct.colors[0]);
    const [selectedImage, setSelectedImage] = useState(heroProduct.slides[0]);
    const [wishlisted, setWishlisted] = useState(false);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setSelectedImage(color.image);
    };

    return (
        <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

                {/* Colonne gauche : image + miniatures */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <img
                            src={selectedImage}
                            alt={heroProduct.name}
                            className="w-full h-auto object-contain p-8 max-h-[450px]"
                        />
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                        {heroProduct.slides.map((slide, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(slide)}
                                className={clsx(
                                    "w-20 h-20 rounded-md border overflow-hidden bg-white p-1 transition-all",
                                    selectedImage === slide
                                        ? "border-primary ring-1 ring-primary scale-105"
                                        : "border-gray-200 hover:border-primary/50"
                                )}
                            >
                                <img src={slide} alt={`Miniature ${i + 1}`} className="w-full h-full object-contain" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colonne droite : infos */}
                <div className="flex flex-col space-y-6">

                    {/* Titre + avis */}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900">
                            {heroProduct.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex text-yellow-500">
                                {[...Array(heroProduct.rating)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <span className="text-gray-500 text-sm border-l border-gray-300 pl-3">
                                {heroProduct.reviews} Avis
                            </span>
                        </div>
                    </div>

                    {/* Prix */}
                    <div className="border-t border-b border-gray-100 py-4">
                        <span className="text-3xl font-medium text-gray-900">
                            {heroProduct.price.toLocaleString('fr-FR')} fcfa
                        </span>
                    </div>

                    {/* Couleur */}
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">
                            Colour : <span className="font-bold text-gray-900">{selectedColor.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {heroProduct.colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorSelect(color)}
                                    className={clsx(
                                        "min-w-[80px] p-2 border rounded-md flex flex-col items-center gap-1 transition-all hover:bg-gray-50",
                                        selectedColor.name === color.name
                                            ? "border-primary ring-1 ring-primary bg-primary/5"
                                            : "border-gray-200"
                                    )}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <span className="text-xs text-gray-700">{color.name}</span>
                                    <span className="text-xs text-green-600 font-medium">Livraison gratuite</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Taille */}
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Taille</p>
                        <button className="px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium">
                            Taille Unique
                        </button>
                    </div>

                    {/* À propos */}
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="font-bold text-lg mb-3">À propos de cet article</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                            {heroProduct.about.map((item, i) => (
                                <li key={i}>
                                    <span className="font-semibold text-gray-800">{item.title} :</span> {item.text}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm font-semibold text-gray-800">{heroProduct.extra}</p>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <Button
                            onClick={() => addToCart({ ...heroProduct, selectedColor: selectedColor.name })}
                            className="flex-1 py-4 text-lg flex items-center justify-center gap-2"
                        >
                            <ShoppingBag /> Ajouter au panier
                        </Button>
                        <Button
                            variant="outline"
                            className={`px-4 ${wishlisted ? 'bg-red-50 border-red-400 text-red-500' : ''}`}
                            onClick={() => setWishlisted(!wishlisted)}
                        >
                            <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
