import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

const PRODUCTS = [
  {
    name: 'Burger Clássico',
    description: 'Pão brioche, blend 160g, queijo cheddar, alface, tomate e nosso molho da casa.',
    price: 28.9,
    category: 'Hambúrgueres',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    available: true,
    featured: true,
    preparationTime: 18,
  },
  {
    name: 'Burger Bacon',
    description: 'Pão brioche, blend 160g, bacon crocante, queijo cheddar e cebola caramelizada.',
    price: 32.9,
    category: 'Hambúrgueres',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    available: true,
    featured: true,
    preparationTime: 20,
  },
  {
    name: 'Burger Duplo',
    description: 'Dois blends de 160g, queijo cheddar duplo, picles e molho especial.',
    price: 38.9,
    category: 'Hambúrgueres',
    imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800',
    available: true,
    featured: false,
    preparationTime: 22,
  },
  {
    name: 'Pizza Calabresa',
    description: 'Mussarela, calabresa fatiada, cebola roxa e azeitonas pretas. Tamanho médio.',
    price: 45.9,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    available: true,
    featured: true,
    preparationTime: 30,
  },
  {
    name: 'Pizza Frango com Catupiry',
    description: 'Frango desfiado, catupiry cremoso, milho e mussarela. Tamanho médio.',
    price: 49.9,
    category: 'Pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    available: true,
    featured: false,
    preparationTime: 30,
  },
  {
    name: 'Batata Frita',
    description: 'Porção generosa de batatas crocantes com sal e parmesão ralado por cima.',
    price: 18.9,
    category: 'Porções',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
    available: true,
    featured: false,
    preparationTime: 12,
  },
  {
    name: 'Nuggets',
    description: 'Dez nuggets de frango empanados com molho barbecue ou mostarda e mel.',
    price: 22.9,
    category: 'Porções',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
    available: true,
    featured: false,
    preparationTime: 14,
  },
  {
    name: 'Coca-Cola 350ml',
    description: 'Lata gelada de Coca-Cola 350ml.',
    price: 6.9,
    category: 'Bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
    available: true,
    featured: false,
    preparationTime: 1,
  },
  {
    name: 'Suco Natural de Laranja',
    description: 'Suco de laranja feito na hora, sem açúcar adicionado. Copo de 400ml.',
    price: 9.9,
    category: 'Bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
    available: true,
    featured: false,
    preparationTime: 5,
  },
  {
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate quentinho servido com bola de sorvete de creme e calda.',
    price: 16.9,
    category: 'Sobremesas',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
    available: true,
    featured: true,
    preparationTime: 10,
  },
  {
    name: 'Combo Família',
    description: '4 burgers clássicos, 2 batatas grandes, 4 refrigerantes lata e 1 sobremesa.',
    price: 129.9,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800',
    available: true,
    featured: true,
    preparationTime: 35,
  },
];

async function seed() {
  console.log('Conectado ao banco. Limpando dados antigos do QuickOrder...');

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const adminHash = await bcrypt.hash('123456', 10);
  const customerHash = await bcrypt.hash('123456', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Administrador',
        email: 'admin@quickorder.com',
        password: adminHash,
        role: 'admin',
      },
      {
        name: 'Cliente Teste',
        email: 'cliente@quickorder.com',
        password: customerHash,
        role: 'customer',
      },
    ],
  });
  console.log('✓ Usuários criados (admin + cliente)');

  await prisma.product.createMany({ data: PRODUCTS });
  console.log(`✓ ${PRODUCTS.length} produtos criados`);

  await prisma.$disconnect();
  console.log('Seed concluído.');
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
