import { useState } from "react";


export default function Developer() {
  return (
    <div className="min-h-screen py-20 bg-[var(--light-gray)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
            Geliştirici <span className="gradient-text">Portalı</span>
          </h1>
          <p className="text-xl text-gray-600 font-normal max-w-3xl mx-auto">
            Kendi AI ajanınızı platform mağazasına yükleyin ve dünya çapında kullanıcılara ulaşın.
          </p>
        </div>

        {/* Demo Message */}
        <div className="glassmorphic rounded-2xl p-8 shadow-lg text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--dark-purple)]">
              Bu sayfa demo sürümümüzde yer almamaktadır
            </h2>
            <p className="text-gray-600">
              Geliştirilme aşamasındadır. Yakın gelecekte kullanıma sunulacaktır. Geliştirici olmakla ilgileniyorsanız lütfen aşağıdaki forma mail adresinizi bırakın. Haydi birlikte harika şeyler üretelim!
            </p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdCdA93GhUgRYcDFYaK8mAdGtZt1sfpRRah4d1HatXDksa59g/viewform?usp=dialog" // <- Buraya kendi form linkini koy
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block px-6 py-3 rounded-lg bg-[var(--dark-purple)] text-white hover:bg-purple-700 transition-colors"
            >
              Geliştirici Formu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}






// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Upload, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { insertAgentSchema } from "@shared/schema";

// const uploadAgentSchema = insertAgentSchema.extend({
//   features: z.array(z.string()).min(1, "En az bir özellik eklenmelidir"),
//   integrations: z.array(z.string()).min(1, "En az bir entegrasyon eklenmelidir"),
// });

// type UploadAgentForm = z.infer<typeof uploadAgentSchema>;

// export default function Developer() {
//   const [newFeature, setNewFeature] = useState("");
//   const [newIntegration, setNewIntegration] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

//   const form = useForm<UploadAgentForm>({
//     resolver: zodResolver(uploadAgentSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       category: "",
//       price: 0,
//       status: "active",
//       iconColor: "blue-purple",
//       features: [],
//       integrations: [],
//       isPopular: false,
//     },
//   });

//   const { watch, setValue } = form;
//   const features = watch("features");
//   const integrations = watch("integrations");

//   const categories = [
//     { value: "Yazım", label: "Yazım" },
//     { value: "Görsel", label: "Görsel" },
//     { value: "Ses", label: "Ses" },
//     { value: "Analiz", label: "Analiz" },
//     { value: "Sohbet", label: "Sohbet" },
//     { value: "Kod", label: "Kod" },
//     { value: "Dil", label: "Dil" },
//     { value: "Pazarlama", label: "Pazarlama" },
//   ];

//   const iconColors = [
//     { value: "blue-purple", label: "Mavi-Mor" },
//     { value: "pink-orange", label: "Pembe-Turuncu" },
//     { value: "green-teal", label: "Yeşil-Turkuaz" },
//     { value: "indigo-purple", label: "İndigo-Mor" },
//     { value: "red-pink", label: "Kırmızı-Pembe" },
//     { value: "yellow-orange", label: "Sarı-Turuncu" },
//     { value: "cyan-blue", label: "Cyan-Mavi" },
//     { value: "violet-purple", label: "Menekşe-Mor" },
//   ];

//   const addFeature = () => {
//     if (newFeature.trim() && !features.includes(newFeature.trim())) {
//       setValue("features", [...features, newFeature.trim()]);
//       setNewFeature("");
//     }
//   };

//   const removeFeature = (index: number) => {
//     setValue("features", features.filter((_, i) => i !== index));
//   };

//   const addIntegration = () => {
//     if (newIntegration.trim() && !integrations.includes(newIntegration.trim())) {
//       setValue("integrations", [...integrations, newIntegration.trim()]);
//       setNewIntegration("");
//     }
//   };

//   const removeIntegration = (index: number) => {
//     setValue("integrations", integrations.filter((_, i) => i !== index));
//   };

//   const onSubmit = async (data: UploadAgentForm) => {
//     setIsSubmitting(true);
//     setSubmitStatus("idle");

//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       console.log("Agent uploaded:", data);
//       setSubmitStatus("success");
//       form.reset();
//     } catch (error) {
//       console.error("Upload error:", error);
//       setSubmitStatus("error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen py-20 bg-[var(--light-gray)]">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--dark-purple)] mb-4">
//             Geliştirici <span className="gradient-text">Portalı</span>
//           </h1>
//           <p className="text-xl text-gray-600 font-normal max-w-3xl mx-auto">
//             Kendi AI ajanınızı platform mağazasına yükleyin ve dünya çapında kullanıcılara ulaşın.
//           </p>
//         </div>

//         {/* Upload Form */}
//         <div className="glassmorphic rounded-2xl p-8 shadow-lg">
//           <div className="flex items-center space-x-3 mb-8">
//             <div className="w-12 h-12 gradient-main rounded-xl flex items-center justify-center">
//               <Upload className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-semibold text-[var(--dark-purple)]">Yeni Ajan Yükle</h2>
//               <p className="text-gray-600">Ajanınızın bilgilerini doldurun ve mağazaya ekleyin</p>
//             </div>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               {/* Basic Info */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Ajan Adı *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="AI Yazım Asistanı" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="category"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Kategori *</FormLabel>
//                       <Select onValueChange={field.onChange} defaultValue={field.value}>
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Kategori seçin" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {categories.map((category) => (
//                             <SelectItem key={category.value} value={category.value}>
//                               {category.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Açıklama *</FormLabel>
//                     <FormControl>
//                       <Textarea 
//                         placeholder="Ajanınızın ne yaptığını detaylı bir şekilde açıklayın..."
//                         className="min-h-[100px]"
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Pricing & Visual */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="price"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Aylık Fiyat (₺) *</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="number" 
//                           placeholder="29"
//                           {...field}
//                           onChange={(e) => field.onChange(Number(e.target.value))}
//                         />
//                       </FormControl>
//                       <FormDescription>
//                         Ajanınız için aylık abonelik ücreti
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="iconColor"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>İkon Rengi</FormLabel>
//                       <Select onValueChange={field.onChange} defaultValue={field.value}>
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Renk seçin" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {iconColors.map((color) => (
//                             <SelectItem key={color.value} value={color.value}>
//                               {color.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Features */}
//               <div>
//                 <FormLabel>Özellikler *</FormLabel>
//                 <div className="space-y-3 mt-2">
//                   <div className="flex gap-2">
//                     <Input
//                       placeholder="Özellik ekleyin..."
//                       value={newFeature}
//                       onChange={(e) => setNewFeature(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
//                     />
//                     <Button type="button" onClick={addFeature} size="sm">
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </div>
                  
//                   {features.length > 0 && (
//                     <div className="flex flex-wrap gap-2">
//                       {features.map((feature, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           <span>{feature}</span>
//                           <button
//                             type="button"
//                             onClick={() => removeFeature(index)}
//                             className="text-purple-600 hover:text-purple-800"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 {form.formState.errors.features && (
//                   <p className="text-sm text-red-600 mt-1">
//                     {form.formState.errors.features.message}
//                   </p>
//                 )}
//               </div>

//               {/* Integrations */}
//               <div>
//                 <FormLabel>Entegrasyonlar *</FormLabel>
//                 <div className="space-y-3 mt-2">
//                   <div className="flex gap-2">
//                     <Input
//                       placeholder="Entegrasyon ekleyin (ör: Google Docs)..."
//                       value={newIntegration}
//                       onChange={(e) => setNewIntegration(e.target.value)}
//                       onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIntegration())}
//                     />
//                     <Button type="button" onClick={addIntegration} size="sm">
//                       <Plus className="w-4 h-4" />
//                     </Button>
//                   </div>
                  
//                   {integrations.length > 0 && (
//                     <div className="flex flex-wrap gap-2">
//                       {integrations.map((integration, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                         >
//                           <span>{integration}</span>
//                           <button
//                             type="button"
//                             onClick={() => removeIntegration(index)}
//                             className="text-blue-600 hover:text-blue-800"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 {form.formState.errors.integrations && (
//                   <p className="text-sm text-red-600 mt-1">
//                     {form.formState.errors.integrations.message}
//                   </p>
//                 )}
//               </div>

//               {/* Submit */}
//               <div className="pt-6 border-t border-gray-200">
//                 {submitStatus === "success" && (
//                   <div className="flex items-center gap-2 text-green-600 mb-4">
//                     <CheckCircle className="w-5 h-5" />
//                     <span>Ajan başarıyla yüklendi! İnceleme sürecinden sonra mağazada görünecektir.</span>
//                   </div>
//                 )}
                
//                 {submitStatus === "error" && (
//                   <div className="flex items-center gap-2 text-red-600 mb-4">
//                     <AlertCircle className="w-5 h-5" />
//                     <span>Yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.</span>
//                   </div>
//                 )}

//                 <Button 
//                   type="submit" 
//                   disabled={isSubmitting}
//                   className="w-full btn-gradient px-8 py-4 text-lg"
//                 >
//                   {isSubmitting ? "Yükleniyor..." : "Ajanı Yükle"}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </div>

//         {/* Guidelines */}
//         <div className="mt-12 glassmorphic rounded-2xl p-8">
//           <h3 className="text-xl font-semibold text-[var(--dark-purple)] mb-6">Yükleme Kuralları</h3>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-semibold text-gray-800 mb-3">✅ Yapılması Gerekenler</h4>
//               <ul className="space-y-2 text-gray-600">
//                 <li>• Detaylı ve açıklayıcı tanımlar yazın</li>
//                 <li>• Gerçek entegrasyonları belirtin</li>
//                 <li>• Ajanınızın sınırlarını belirtin</li>
//                 <li>• Güncel özellik listesi sağlayın</li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold text-gray-800 mb-3">❌ Yapılmaması Gerekenler</h4>
//               <ul className="space-y-2 text-gray-600">
//                 <li>• Yanıltıcı özellik tanımları</li>
//                 <li>• Telif hakkı ihlali içeren içerik</li>
//                 <li>• Zararlı veya etik olmayan kullanım</li>
//                 <li>• Spam veya düşük kaliteli içerik</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }