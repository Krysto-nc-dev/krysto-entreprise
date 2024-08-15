'use client'
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import {
  saveActivityLogsNotification,
  updateFunnelProducts,
} from '@/lib/queries'
import { Funnel } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DolibarrProduct } from '@/lib/dolibarrQueries/dolibarrProductQueries' // Assurez-vous que cette importation est correcte

interface FunnelProductsTableProps {
  defaultData: Funnel
  products: DolibarrProduct[] // Type des produits Dolibarr
}

const FunnelProductsTable: React.FC<FunnelProductsTableProps> = ({
  products,
  defaultData,
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [liveProducts, setLiveProducts] = useState<
    { productId: string; recurring: boolean }[] | []
  >(JSON.parse(defaultData.liveProducts || '[]'))

  const handleSaveProducts = async () => {
    setIsLoading(true)
    const response = await updateFunnelProducts(
      JSON.stringify(liveProducts),
      defaultData.id
    )
    await saveActivityLogsNotification({
      organisationId: undefined,
      description: `Update funnel products | ${response.name}`,
      subAccountId: defaultData.subAccountId,
    })
    setIsLoading(false)
    router.refresh()
  }

  const handleAddProduct = async (product: DolibarrProduct) => {
    const productIdExists = liveProducts.find(
      (prod) => prod.productId === product.id
    )
    productIdExists
      ? setLiveProducts(
          liveProducts.filter(
            (prod) => prod.productId !== product.id
          )
        )
      : setLiveProducts([
          ...liveProducts,
          {
            productId: product.id as string,
            recurring: false, // Si Dolibarr ne gère pas les abonnements, laisser `recurring` à `false`
          },
        ])
  }
  return (
    <>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead>Live</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Input
                  defaultChecked={
                    !!liveProducts.find(
                      (prod) => prod.productId === product.id
                    )
                  }
                  onChange={() => handleAddProduct(product)}
                  type="checkbox"
                  className="w-4 h-4"
                />
              </TableCell>
              <TableCell>
                <Image
                  alt="product Image"
                  height={60}
                  width={60}
                  src={product.image_url || '/default-product.png'} // Remplacez par une image par défaut si nécessaire
                />
              </TableCell>
              <TableCell>{product.label}</TableCell>
              <TableCell>
                {product.type === 'service' ? 'Service' : 'Product'}
              </TableCell>
              <TableCell className="text-right">
                ${product.price}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        disabled={isLoading}
        onClick={handleSaveProducts}
        className="mt-4"
      >
        Save Products
      </Button>
    </>
  )
}

export default FunnelProductsTable
