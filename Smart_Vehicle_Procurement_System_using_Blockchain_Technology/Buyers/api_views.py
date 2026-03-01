from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import userRegisteredTable, Vehicle1
from seller.models import Vehicle
import hashlib
import time
import random
import json
import re

@api_view(['POST'])
def api_login(request):
    loginid = request.data.get('loginid')
    password = request.data.get('password')
    role = request.data.get('role')
    print(f"Login attempt: ID={loginid}, Role={role}")
    
    try:
        if role == 'buyer':
            user = userRegisteredTable.objects.get(loginid=loginid, password=password)
            if user.status != 'Active':
                return Response({'error': 'Account not active. Wait for admin approval.'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'id': user.id, 'name': user.name, 'email': user.email, 'role': 'buyer'})
        elif role == 'seller':
            from seller.models import sellerRegisteredTable
            user = sellerRegisteredTable.objects.get(loginid=loginid, password=password)
            if user.status != 'Active':
                return Response({'error': 'Account not active. Wait for admin approval.'}, status=status.HTTP_403_FORBIDDEN)
            return Response({
                'id': user.id, 'name': user.name, 'email': user.email, 'role': 'seller',
                'bank_account_number': user.bank_account_number or '',
                'ifsc_code': user.ifsc_code or '',
                'bank_name': user.bank_name or ''
            })
        elif role == 'admin':
            if loginid == 'admin' and password == 'admin':
                return Response({'id': 0, 'name': 'Administrator', 'email': 'admin@system.com', 'role': 'admin'})
            return Response({'error': 'Invalid admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def api_register(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    loginid = request.data.get('loginid', '').strip()
    mobile = request.data.get('mobile', '').strip()
    password = request.data.get('password', '').strip()
    role = request.data.get('role', 'buyer')

    if not all([name, email, loginid, mobile, password]):
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(mobile) != 10 or not mobile.isdigit():
        return Response({'error': 'Mobile number must be exactly 10 digits.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        from django.core.exceptions import ValidationError
        if role == 'buyer':
            if userRegisteredTable.objects.filter(loginid=loginid).exists():
                return Response({'error': 'Login ID already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            if userRegisteredTable.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)
            user = userRegisteredTable(name=name, email=email, loginid=loginid, mobile=mobile, password=password, status='waiting')
            try:
                user.full_clean()
                user.save()
            except ValidationError as ve:
                errors = []
                for field, error_list in ve.message_dict.items():
                    errors.extend(error_list)
                return Response({'error': errors[0] if errors else 'Validation Error'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': 'Buyer registered! Wait for admin approval.'}, status=status.HTTP_201_CREATED)
        elif role == 'seller':
            from seller.models import sellerRegisteredTable
            bank_account_number = request.data.get('bank_account_number', '').strip()
            ifsc_code = request.data.get('ifsc_code', '').strip()
            bank_name = request.data.get('bank_name', '').strip()
            
            if sellerRegisteredTable.objects.filter(loginid=loginid).exists():
                return Response({'error': 'Login ID already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            if sellerRegisteredTable.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)
            seller = sellerRegisteredTable(
                name=name, email=email, loginid=loginid, mobile=mobile, password=password, status='waiting',
                bank_account_number=bank_account_number, ifsc_code=ifsc_code, bank_name=bank_name
            )
            try:
                seller.full_clean()
                seller.save()
            except ValidationError as ve:
                errors = []
                for field, error_list in ve.message_dict.items():
                    errors.extend(error_list)
                return Response({'error': errors[0] if errors else 'Validation Error'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': 'Seller registered! Wait for admin approval.'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── ADMIN USER MANAGEMENT APIs ─────────────────────────────────────────────

@api_view(['GET'])
def api_admin_buyers(request):
    """List all buyers"""
    users = userRegisteredTable.objects.all().order_by('id')
    data = [{'id': u.id, 'loginid': u.loginid, 'name': u.name, 'email': u.email, 'mobile': u.mobile, 'status': u.status} for u in users]
    return Response(data)

@api_view(['GET'])
def api_admin_sellers(request):
    """List all sellers"""
    from seller.models import sellerRegisteredTable
    users = sellerRegisteredTable.objects.all().order_by('id')
    data = [{'id': u.id, 'loginid': u.loginid, 'name': u.name, 'email': u.email, 'mobile': u.mobile, 'status': u.status} for u in users]
    return Response(data)

@api_view(['POST'])
def api_admin_activate_buyer(request):
    """Activate or deactivate a buyer"""
    user_id = request.data.get('id')
    action = request.data.get('action')  # 'activate' or 'deactivate'
    try:
        user = userRegisteredTable.objects.get(id=user_id)
        user.status = 'Active' if action == 'activate' else 'Inactive'
        user.save()
        return Response({'message': f'Buyer {action}d successfully.', 'status': user.status})
    except userRegisteredTable.DoesNotExist:
        return Response({'error': 'Buyer not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def api_admin_activate_seller(request):
    """Activate or deactivate a seller"""
    from seller.models import sellerRegisteredTable
    user_id = request.data.get('id')
    action = request.data.get('action')  # 'activate' or 'deactivate'
    try:
        user = sellerRegisteredTable.objects.get(id=user_id)
        user.status = 'Active' if action == 'activate' else 'Inactive'
        user.save()
        return Response({'message': f'Seller {action}d successfully.', 'status': user.status})
    except sellerRegisteredTable.DoesNotExist:
        return Response({'error': 'Seller not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def api_admin_delete_user(request):
    """Delete a buyer or seller"""
    user_id = request.data.get('user_id') or request.data.get('id')
    role = request.data.get('role')
    try:
        if role == 'buyer':
            user = userRegisteredTable.objects.get(id=user_id)
            user.delete()
        elif role == 'seller':
            from seller.models import sellerRegisteredTable
            user = sellerRegisteredTable.objects.get(id=user_id)
            user.delete()
        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': f'{role.capitalize()} deleted successfully.'})
    except Exception as e:
        return Response({'error': 'User not found or deletion failed.'}, status=status.HTTP_404_NOT_FOUND)



# ─── SELLER APIs ──────────────────────────────────────────────────────────────

@api_view(['POST'])
def api_add_vehicle(request):
    """Add a new vehicle to the blockchain"""
    import base64 as b64_module, os
    from django.conf import settings
    from django.core.files.base import ContentFile

    vehicle_number = request.data.get('vehicle_number', '').strip().upper()
    accidents_history = request.data.get('accidents_history', '').strip()
    price = request.data.get('price', '')
    seller_id = request.data.get('seller_id', '')

    # URL/link fields
    photo_url      = request.data.get('photo_url', '').strip()
    documents_url  = request.data.get('documents_url', '').strip()

    # Base64 file fields (file upload from device)
    photo_base64      = request.data.get('photo_base64', '').strip()
    photo_filename    = request.data.get('photo_filename', 'photo.jpg').strip()
    doc_base64        = request.data.get('doc_base64', '').strip()
    doc_filename      = request.data.get('doc_filename', 'document.pdf').strip()

    if not vehicle_number or not price:
        return Response({'error': 'Vehicle number and price are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate format: AP34DH5001
    pattern = r'^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$'
    if not re.match(pattern, vehicle_number):
        return Response({'error': 'Invalid vehicle number format. Use format: AP34DH5001'}, status=status.HTTP_400_BAD_REQUEST)

    if Vehicle.objects.filter(vehicle_number=vehicle_number).exists():
        return Response({'error': 'Vehicle number already registered.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        price_val = float(price)
        if price_val <= 0:
            return Response({'error': 'Price must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        if price_val >= 100000000:
            return Response({'error': 'Price is too high. Maximum allowed is 99999999.99.'}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({'error': 'Invalid price value.'}, status=status.HTTP_400_BAD_REQUEST)

    # ── Helper: save base64 data to media folder ──────────────────────────────
    def save_base64_file(base64_str, filename, subfolder):
        """Decode base64 string and save to MEDIA_ROOT/subfolder/filename"""
        try:
            file_bytes = b64_module.b64decode(base64_str)
            safe_name = re.sub(r'[^\w\.\-]', '_', filename)
            rel_path = f'{subfolder}/{safe_name}'
            full_path = os.path.join(settings.MEDIA_ROOT, rel_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'wb') as f:
                f.write(file_bytes)
            return rel_path
        except Exception as ex:
            return None

    # Determine final photo and document paths
    final_photo_path = None
    final_doc_path   = None

    if photo_base64:
        # Uploaded file takes priority over URL
        final_photo_path = save_base64_file(photo_base64, photo_filename, 'vehicles/pictures')
    elif photo_url:
        final_photo_path = photo_url

    if doc_base64:
        final_doc_path = save_base64_file(doc_base64, doc_filename, 'vehicles/documents')
    elif documents_url:
        final_doc_path = documents_url

    # Generate blockchain hash
    raw_data = json.dumps({'vehicle_number': vehicle_number, 'price': price, 'timestamp': time.time(), 'seller': str(seller_id)})
    block_hash = '0x' + hashlib.sha256(raw_data.encode()).hexdigest()

    try:
        vehicle = Vehicle(
            vehicle_number=vehicle_number,
            seller_id=seller_id,
            accidents_history=accidents_history,
            price=price_val,
            block_hash=block_hash,
            status='available'
        )
        if final_photo_path:
            vehicle.picture.name = final_photo_path
        if final_doc_path:
            vehicle.ownership_documents.name = final_doc_path
        vehicle.save()

        vehicle1 = Vehicle1(
            vehicle_number=vehicle_number,
            seller_id=seller_id,
            accidents_history=accidents_history,
            price=price_val,
            block_hash=block_hash,
            status='available'
        )
        if final_photo_path:
            vehicle1.picture.name = final_photo_path
        if final_doc_path:
            vehicle1.ownership_documents.name = final_doc_path
        vehicle1.save()

        # Build response URL for doc
        doc_display_url = final_doc_path
        if final_doc_path and not final_doc_path.startswith('http'):
            doc_display_url = f'/media/{final_doc_path}'

        return Response({
            'message': f'Vehicle {vehicle_number} added to blockchain!',
            'vehicle_number': vehicle_number,
            'block_hash': block_hash,
            'price': str(price_val),
            'photo': final_photo_path or '',
            'document': doc_display_url or '',
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Failed to add vehicle: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def api_vehicle_history(request):
    """Get all vehicles listed by sellers, filtered by seller_id if given"""
    seller_id = request.GET.get('seller_id')
    if seller_id:
        vehicles = Vehicle.objects.filter(seller_id=seller_id).order_by('-id')
    else:
        vehicles = Vehicle.objects.all().order_by('-id')
    data = []
    for v in vehicles:
        # Determine picture URL: external URL (http) or Django media URL
        pic = str(v.picture) if v.picture else None
        if pic and not pic.startswith('http'):
            try:
                pic = v.picture.url  # Django media URL
            except Exception:
                pic = None
        # Determine documents URL
        doc = str(v.ownership_documents) if v.ownership_documents else None
        if doc and not doc.startswith('http'):
            try:
                doc = v.ownership_documents.url
            except Exception:
                doc = None
        data.append({
            'id': v.id,
            'vehicle_number': v.vehicle_number,
            'price': str(v.price),
            'accidents_history': v.accidents_history or 'None',
            'status': v.status,
            'block_hash': v.block_hash or '',
            'picture': pic,
            'documents': doc,
        })
    return Response(data)

@api_view(['GET'])
def api_browse_vehicles(request):
    vehicles = Vehicle.objects.filter(status='available')
    data = []
    for v in vehicles:
        doc = str(v.ownership_documents) if v.ownership_documents else None
        if doc and not doc.startswith('http'):
            try:
                doc = v.ownership_documents.url
            except Exception:
                doc = None
        data.append({
            'vehicle_number': v.vehicle_number,
            'price': str(v.price),
            'accidents_history': v.accidents_history,
            'picture': v.picture.url if v.picture else None,
            'documents': doc,
        })
    return Response(data)

@api_view(['POST'])
def api_purchase_vehicle(request):
    from Buyers.models import Transaction, userRegisteredTable
    vehicle_number = request.data.get('vehicle_number')
    buyer_id = request.data.get('buyer_id')
    buyer_name = request.data.get('buyer_name')
    buyer_transaction_id = request.data.get('buyer_transaction_id', '').strip()
    
    if not buyer_transaction_id:
        return Response({'error': 'Transaction ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        vehicle = Vehicle.objects.get(vehicle_number=vehicle_number, status='available')
        vehicle1 = Vehicle1.objects.get(vehicle_number=vehicle_number, status='available')
        
        raw_data = f"{vehicle_number}{vehicle.price}{time.time()}{random.randint(1, 999999)}"
        block_hash = '0x' + hashlib.sha256(raw_data.encode()).hexdigest()
        
        vehicle.block_hash = block_hash
        vehicle.status = 'pending'
        vehicle.save()
        
        vehicle1.block_hash = block_hash
        vehicle1.status = 'pending'
        vehicle1.save()
        
        Transaction.objects.create(
            vehicle_number=vehicle_number,
            buyer_id=buyer_id,
            seller_id=vehicle.seller_id,
            buyer_name=buyer_name,
            price=vehicle.price,
            hash_code=block_hash,
            buyer_transaction_id=buyer_transaction_id,
            status='pending'
        )
        
        return Response({'status': 'success', 'transaction_id': block_hash})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def api_admin_transactions(request):
    from Buyers.models import Transaction
    transactions = Transaction.objects.all().order_by('-created_at')
    data = [{
        'id': t.id,
        'vehicle_number': t.vehicle_number,
        'buyer_id': t.buyer_id,
        'buyer_name': t.buyer_name,
        'price': str(t.price),
        'hash_code': t.hash_code,
        'buyer_transaction_id': t.buyer_transaction_id or '',
        'seller_transaction_id': t.seller_transaction_id or '',
        'status': t.status,
    } for t in transactions]
    return Response(data)

@api_view(['POST'])
def api_admin_approve_transaction(request):
    from Buyers.models import Transaction
    hash_code = request.data.get('hash_code')
    
    try:
        t = Transaction.objects.get(hash_code=hash_code, status='pending')
        t.status = 'approved'
        t.save()
        
        vehicle = Vehicle.objects.get(vehicle_number=t.vehicle_number)
        vehicle.status = 'sold'
        vehicle.save()
        
        vehicle1 = Vehicle1.objects.get(vehicle_number=t.vehicle_number)
        vehicle1.status = 'sold'
        vehicle1.save()
        
        return Response({'message': 'Transaction approved, ownership changed.'})
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction not found or already processed.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def api_buyer_transactions(request):
    buyer_id = request.GET.get('buyer_id')
    if not buyer_id:
        return Response({'error': 'buyer_id required'}, status=status.HTTP_400_BAD_REQUEST)
    from Buyers.models import Transaction
    transactions = Transaction.objects.filter(buyer_id=buyer_id).order_by('-created_at')
    data = [{
        'id': t.id,
        'vehicle_number': t.vehicle_number,
        'price': str(t.price),
        'buyer_name': t.buyer_name,
        'hash_code': t.hash_code,
        'buyer_transaction_id': t.buyer_transaction_id or '',
        'seller_transaction_id': t.seller_transaction_id or '',
        'status': t.status,
        'created_at': str(t.created_at)
    } for t in transactions]
    return Response(data)

@api_view(['POST'])
def api_seller_update_transaction(request):
    from Buyers.models import Transaction
    hash_code = request.data.get('hash_code', '').strip()
    seller_transaction_id = request.data.get('seller_transaction_id', '').strip()
    
    if not seller_transaction_id:
        return Response({'error': 'Seller Transaction ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not hash_code:
        return Response({'error': 'Block hash code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        t = Transaction.objects.get(hash_code=hash_code)
        t.seller_transaction_id = seller_transaction_id
        t.save()
        return Response({'message': 'Transaction ID updated successfully.'})
    except Transaction.DoesNotExist:
        # Return the hash we got, to help with debugging
        return Response({'error': f'Transaction not found for hash: {hash_code[:20]}...'}, status=status.HTTP_404_NOT_FOUND)

